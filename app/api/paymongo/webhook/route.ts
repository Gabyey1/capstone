import crypto from "crypto";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type PayMongoAttributes = Record<string, unknown>;

type PayMongoResource = {
  id?: unknown;
  type?: unknown;
  attributes?: PayMongoAttributes | null;
};

type PayMongoEventData = {
  id?: unknown;
  type?: unknown;
  attributes?: PayMongoAttributes | null;
  data?: PayMongoResource | null;
};

type PayMongoWebhookPayload = {
  data?: PayMongoEventData | null;
};

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null
  );
}

function verifyPayMongoSignature(
  rawBody: string,
  signatureHeader: string,
  webhookSecret: string
): boolean {
  const parts = signatureHeader.split(",");

  let timestamp = "";
  let testSignature = "";
  let liveSignature = "";

  for (const part of parts) {
    const separatorIndex = part.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = part.slice(
      0,
      separatorIndex
    );

    const value = part.slice(
      separatorIndex + 1
    );

    if (key === "t") {
      timestamp = value;
    }

    if (key === "te") {
      testSignature = value;
    }

    if (key === "li") {
      liveSignature = value;
    }
  }

  if (!timestamp) {
    return false;
  }

  const signedPayload =
    `${timestamp}.${rawBody}`;

  const expectedSignature =
    crypto
      .createHmac(
        "sha256",
        webhookSecret
      )
      .update(signedPayload)
      .digest("hex");

  /*
   * PayMongo sends:
   *
   * te = test signature
   * li = live signature
   *
   * We use the test signature when available because
   * you are currently using the PayMongo test environment.
   */
  const providedSignature =
    testSignature || liveSignature;

  if (!providedSignature) {
    return false;
  }

  if (
    expectedSignature.length !==
    providedSignature.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(providedSignature)
  );
}

function generateReceiptNumber(
  paymentId: number
) {
  return `OR-${paymentId}`;
}

export async function POST(
  request: Request
) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Check webhook secret
     * ---------------------------------------------------------
     */

    const webhookSecret =
      process.env.PAYMONGO_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "PAYMONGO_WEBHOOK_SECRET is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Webhook is not configured.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Read RAW request body
     * ---------------------------------------------------------
     *
     * IMPORTANT:
     * Do not use request.json() before signature verification.
     * PayMongo signs the raw request body.
     * ---------------------------------------------------------
     */

    const rawBody =
      await request.text();

    /*
     * ---------------------------------------------------------
     * 3. Get PayMongo signature
     * ---------------------------------------------------------
     */

    const signatureHeader =
      request.headers.get(
        "Paymongo-Signature"
      );

    if (!signatureHeader) {
      console.error(
        "PayMongo webhook signature is missing."
      );

      return NextResponse.json(
        {
          error:
            "Missing webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Verify signature
     * ---------------------------------------------------------
     */

    const validSignature =
      verifyPayMongoSignature(
        rawBody,
        signatureHeader,
        webhookSecret
      );

    if (!validSignature) {
      console.error(
        "Invalid PayMongo webhook signature."
      );

      return NextResponse.json(
        {
          error:
            "Invalid webhook signature.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Parse webhook payload
     * ---------------------------------------------------------
     */

    let parsedPayload: unknown;

    try {
      parsedPayload =
        JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid webhook payload.",
        },
        {
          status: 400,
        }
      );
    }

    if (!isRecord(parsedPayload)) {
      return NextResponse.json(
        {
          error:
            "Invalid webhook payload.",
        },
        {
          status: 400,
        }
      );
    }

    const payload =
      parsedPayload as PayMongoWebhookPayload;

    /*
     * ---------------------------------------------------------
     * 6. Get event data
     * ---------------------------------------------------------
     */

    const eventData =
      payload.data;

    if (!eventData) {
      return NextResponse.json(
        {
          error:
            "Webhook event data is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const eventAttributes =
      eventData.attributes;

    const eventType =
      typeof eventData.type === "string"
        ? eventData.type
        : typeof eventAttributes?.type ===
          "string"
        ? eventAttributes.type
        : "";

    console.log(
      "PayMongo webhook received:",
      eventType
    );

    /*
     * ---------------------------------------------------------
     * 7. Ignore events we don't need
     * ---------------------------------------------------------
     */

    if (
      eventType !==
      "checkout_session.payment.paid"
    ) {
      return NextResponse.json(
        {
          received: true,
          message:
            "Event received and ignored.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. Get checkout session
     * ---------------------------------------------------------
     */

    const checkoutSession =
      eventData.data ??
      (isRecord(
        eventAttributes?.data
      )
        ? (eventAttributes.data as PayMongoResource)
        : null);

    if (!checkoutSession) {
      console.error(
        "Checkout session data is missing."
      );

      return NextResponse.json(
        {
          error:
            "Checkout session data is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const checkoutId =
      typeof checkoutSession.id ===
      "string"
        ? checkoutSession.id
        : "";

    if (!checkoutId) {
      console.error(
        "Checkout session ID is missing."
      );

      return NextResponse.json(
        {
          error:
            "Checkout session ID is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const checkoutAttributes =
      checkoutSession.attributes ??
      {};

    /*
     * ---------------------------------------------------------
     * 9. Get PayMongo payment
     * ---------------------------------------------------------
     */

    const rawPayments =
      checkoutAttributes.payments;

    const payments: PayMongoResource[] =
      Array.isArray(rawPayments)
        ? rawPayments.filter(
            (
              payment
            ): payment is PayMongoResource =>
              isRecord(payment)
          )
        : [];

    if (payments.length === 0) {
      console.error(
        "No PayMongo payments found in checkout session:",
        checkoutId
      );

      return NextResponse.json(
        {
          error:
            "PayMongo payment is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const successfulPayment =
      payments.find(
        (payment) => {
          const attributes =
            payment.attributes ??
            {};

          return (
            attributes.status ===
            "paid"
          );
        }
      ) ?? payments[0];

    const paymongoPaymentId =
      typeof successfulPayment.id ===
      "string"
        ? successfulPayment.id
        : "";

    if (!paymongoPaymentId) {
      console.error(
        "PayMongo payment ID is missing."
      );

      return NextResponse.json(
        {
          error:
            "PayMongo payment ID is missing.",
        },
        {
          status: 400,
        }
      );
    }

    const paymentAttributes =
      successfulPayment.attributes ??
      {};

    /*
     * ---------------------------------------------------------
     * 10. Determine payment method
     * ---------------------------------------------------------
     */

    const source =
      isRecord(
        paymentAttributes.source
      )
        ? paymentAttributes.source
        : null;

    const paymongoMethod =
      typeof source?.type ===
      "string"
        ? source.type
        : "";

    let paymentMethod:
      | "GCASH"
      | "MAYA";

    if (
      paymongoMethod === "gcash"
    ) {
      paymentMethod = "GCASH";
    } else if (
      paymongoMethod ===
      "paymaya"
    ) {
      paymentMethod = "MAYA";
    } else {
      console.error(
        "Unsupported PayMongo payment method:",
        paymongoMethod
      );

      return NextResponse.json(
        {
          error:
            "Unsupported payment method.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 11. Find our local payment
     * ---------------------------------------------------------
     */

    const existingPayment =
      await prisma.payment.findUnique(
        {
          where: {
            paymongoCheckoutId:
              checkoutId,
          },

          include: {
            due: true,
            receipt: true,
          },
        }
      );

    if (!existingPayment) {
      console.error(
        "Local payment record not found:",
        checkoutId
      );

      return NextResponse.json(
        {
          error:
            "Local payment record not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 12. Idempotency
     * ---------------------------------------------------------
     *
     * PayMongo can retry webhook delivery.
     *
     * If we already processed this payment,
     * do not add the amount to the due again.
     * ---------------------------------------------------------
     */

    if (
      existingPayment.status ===
      "PAID"
    ) {
      return NextResponse.json(
        {
          received: true,
          message:
            "Payment was already processed.",
        },
        {
          status: 200,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 13. Verify due exists
     * ---------------------------------------------------------
     */

    if (
      !existingPayment.dueId ||
      !existingPayment.due
    ) {
      console.error(
        "Payment is not connected to a due:",
        existingPayment.id
      );

      return NextResponse.json(
        {
          error:
            "Payment is not connected to a monthly due.",
        },
        {
          status: 400,
        }
      );
    }

    const due =
      existingPayment.due;

    /*
     * ---------------------------------------------------------
     * 14. Verify payment amount
     * ---------------------------------------------------------
     */

    const rawPaymongoAmount =
      paymentAttributes.amount;

    const paymongoAmount =
      typeof rawPaymongoAmount ===
      "number"
        ? rawPaymongoAmount
        : Number(
            rawPaymongoAmount
          );

    const localAmount =
      Number(
        existingPayment.amount
      );

    if (
      !Number.isFinite(
        paymongoAmount
      ) ||
      paymongoAmount <= 0
    ) {
      console.error(
        "Invalid PayMongo payment amount:",
        rawPaymongoAmount
      );

      return NextResponse.json(
        {
          error:
            "Invalid PayMongo payment amount.",
        },
        {
          status: 400,
        }
      );
    }

    const expectedAmount =
      Math.round(
        localAmount * 100
      );

    if (
      paymongoAmount !==
      expectedAmount
    ) {
      console.error(
        "PayMongo amount does not match local payment amount.",
        {
          paymentId:
            existingPayment.id,

          expectedAmount,

          paymongoAmount,
        }
      );

      return NextResponse.json(
        {
          error:
            "Payment amount does not match.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 15. Calculate new due balance
     * ---------------------------------------------------------
     */

    const oldAmountPaid =
      Number(
        due.amountPaid
      );

    const paymentAmount =
      Number(
        existingPayment.amount
      );

    const newAmountPaid =
      oldAmountPaid +
      paymentAmount;

    const dueAmount =
      Number(due.amount);

    const newBalance =
      dueAmount -
      newAmountPaid;

    let newStatus:
      | "UNPAID"
      | "PARTIAL"
      | "PAID";

    if (
      newBalance <= 0
    ) {
      newStatus = "PAID";
    } else if (
      newAmountPaid > 0
    ) {
      newStatus = "PARTIAL";
    } else {
      newStatus = "UNPAID";
    }

    /*
     * ---------------------------------------------------------
     * 16. Update everything atomically
     * ---------------------------------------------------------
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * Mark payment as PAID
           */
          const updatedPayment =
            await tx.payment.update(
              {
                where: {
                  id: existingPayment.id,
                },

                data: {
                  status: "PAID",

                  method:
                    paymentMethod,

                  paymongoPaymentId:
                    paymongoPaymentId,

                  paidAt:
                    new Date(),

                  updatedAt:
                    new Date(),
                },
              }
            );

          /*
           * Update monthly due
           */
          const updatedDue =
            await tx.due.update(
              {
                where: {
                  id: due.id,
                },

                data: {
                  amountPaid:
                    newAmountPaid,

                  balance:
                    Math.max(
                      newBalance,
                      0
                    ),

                  status:
                    newStatus,

                  updatedAt:
                    new Date(),
                },
              }
            );

          /*
           * Generate receipt
           */
          let receipt =
            existingPayment.receipt;

          if (!receipt) {
            receipt =
              await tx.receipt.create(
                {
                  data: {
                    paymentId:
                      updatedPayment.id,

                    receiptNumber:
                      generateReceiptNumber(
                        updatedPayment.id
                      ),

                    issuedAt:
                      new Date(),

                    createdAt:
                      new Date(),
                  },
                }
              );
          }

          return {
            payment:
              updatedPayment,

            due:
              updatedDue,

            receipt,
          };
        }
      );

    /*
     * ---------------------------------------------------------
     * 17. Log successful payment
     * ---------------------------------------------------------
     */

    console.log(
      "PayMongo payment processed successfully:",
      {
        paymentId:
          result.payment.id,

        dueId:
          result.due.id,

        paymongoCheckoutId:
          checkoutId,

        paymongoPaymentId:
          paymongoPaymentId,

        amount:
          result.payment.amount.toString(),

        method:
          result.payment.method,

        receiptNumber:
          result.receipt
            .receiptNumber,
      }
    );

    /*
     * ---------------------------------------------------------
     * 18. Return success
     * ---------------------------------------------------------
     */

    return NextResponse.json(
      {
        received: true,

        message:
          "Payment processed successfully.",

        payment: {
          id:
            result.payment.id,

          amount:
            result.payment.amount.toString(),

          method:
            result.payment.method,

          status:
            result.payment.status,

          paymongoPaymentId:
            result.payment
              .paymongoPaymentId,

          paidAt:
            result.payment.paidAt,
        },

        due: {
          id:
            result.due.id,

          amountPaid:
            result.due.amountPaid.toString(),

          balance:
            result.due.balance.toString(),

          status:
            result.due.status,
        },

        receipt: {
          id:
            result.receipt.id,

          receiptNumber:
            result.receipt
              .receiptNumber,

          issuedAt:
            result.receipt.issuedAt,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "PayMongo webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process PayMongo webhook.",
      },
      {
        status: 500,
      }
    );
  }
}