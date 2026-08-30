import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";

type PayMongoError = {
  detail?: string;
};

type PayMongoCheckoutData = {
  id?: string;
  attributes?: {
    checkout_url?: string;
  };
};

type PayMongoResponse = {
  data?: PayMongoCheckoutData;
  errors?: PayMongoError[];
};

export async function POST(request: Request) {
  try {
    /*
     * ---------------------------------------------------------
     * 1. Check homeowner authentication
     * ---------------------------------------------------------
     */

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    if (session.user.role !== "HOMEOWNER") {
      return NextResponse.json(
        {
          error: "Forbidden.",
        },
        {
          status: 403,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 2. Validate the logged-in user's ID
     * ---------------------------------------------------------
     */

    const userId = Number(session.user.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        {
          error: "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 3. Check PayMongo secret key
     * ---------------------------------------------------------
     *
     * Add this to .env.local:
     *
     * PAYMONGO_SECRET_KEY="sk_test_..."
     * ---------------------------------------------------------
     */

    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      console.error(
        "PAYMONGO_SECRET_KEY is not configured."
      );

      return NextResponse.json(
        {
          error:
            "Online payment is not configured yet. Please contact the administrator.",
        },
        {
          status: 503,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 4. Read request body
     * ---------------------------------------------------------
     */

    let body: { dueId?: unknown };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const dueId = Number(body.dueId);

    if (!Number.isInteger(dueId) || dueId <= 0) {
      return NextResponse.json(
        {
          error: "A valid monthly due is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 5. Find homeowner profile
     * ---------------------------------------------------------
     */

    const homeowner = await prisma.homeowner.findUnique({
      where: {
        userId,
      },
    });

    if (!homeowner) {
      return NextResponse.json(
        {
          error: "Homeowner profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 6. Find the selected due
     *
     * We verify homeownerId here so a homeowner cannot
     * attempt to pay another homeowner's due.
     * ---------------------------------------------------------
     */

    const due = await prisma.due.findFirst({
      where: {
        id: dueId,
        homeownerId: homeowner.id,
      },
    });

    if (!due) {
      return NextResponse.json(
        {
          error: "Monthly due not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 7. Check remaining balance
     * ---------------------------------------------------------
     */

    const balance = Number(due.balance);

    if (!Number.isFinite(balance) || balance <= 0) {
      return NextResponse.json(
        {
          error:
            "This monthly due has already been fully paid.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 8. Convert amount to centavos
     *
     * PayMongo expects amounts in the smallest currency unit.
     *
     * Example:
     *
     * ₱1,500.00 -> 150000
     * ---------------------------------------------------------
     */

    const amountInCentavos = Math.round(balance * 100);

    if (amountInCentavos <= 0) {
      return NextResponse.json(
        {
          error: "Invalid payment amount.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 9. Get application URL
     * ---------------------------------------------------------
     */

    const appUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    /*
     * ---------------------------------------------------------
     * 10. Build checkout session
     * ---------------------------------------------------------
     */

    const checkoutPayload = {
      data: {
        attributes: {
          line_items: [
            {
              currency: "PHP",
              amount: amountInCentavos,
              name: `Monthly Due - ${due.month}/${due.year}`,
              quantity: 1,
            },
          ],

          payment_method_types: [
            "gcash",
            "paymaya",
          ],

          description:
            `Homeowner monthly due for ${due.month}/${due.year}`,

          success_url:
            `${appUrl}/homeowner/payments?payment=success&dueId=${due.id}`,

          cancel_url:
            `${appUrl}/homeowner/payments?payment=cancelled&dueId=${due.id}`,

          send_email_receipt: false,

          show_description: true,

          show_line_items: true,
        },
      },
    };

    /*
     * ---------------------------------------------------------
     * 11. Create PayMongo checkout session
     * ---------------------------------------------------------
     */

    const paymongoResponse = await fetch(
      `${PAYMONGO_API_URL}/checkout_sessions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization:
            `Basic ${Buffer.from(
              `${secretKey}:`
            ).toString("base64")}`,
        },

        body: JSON.stringify(checkoutPayload),
      }
    );

    /*
     * ---------------------------------------------------------
     * 12. Read PayMongo response safely
     * ---------------------------------------------------------
     */

    let paymongoData: PayMongoResponse;

    try {
      paymongoData =
        (await paymongoResponse.json()) as PayMongoResponse;
    } catch {
      console.error(
        "PayMongo returned an invalid JSON response."
      );

      return NextResponse.json(
        {
          error:
            "PayMongo returned an invalid response.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 13. Handle PayMongo errors
     * ---------------------------------------------------------
     */

    if (!paymongoResponse.ok) {
      console.error(
        "PayMongo checkout error:",
        paymongoData
      );

      const paymongoError =
        paymongoData.errors?.[0]?.detail;

      return NextResponse.json(
        {
          error:
            typeof paymongoError === "string"
              ? paymongoError
              : "Unable to create payment checkout.",
        },
        {
          status:
            paymongoResponse.status >= 400 &&
            paymongoResponse.status < 600
              ? paymongoResponse.status
              : 502,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 14. Extract checkout session
     * ---------------------------------------------------------
     */

    const checkoutSession =
      paymongoData.data;

    const checkoutId =
      typeof checkoutSession?.id === "string"
        ? checkoutSession.id
        : "";

    const checkoutUrl =
      typeof checkoutSession?.attributes
        ?.checkout_url === "string"
        ? checkoutSession.attributes.checkout_url
        : "";

    if (!checkoutId || !checkoutUrl) {
      console.error(
        "PayMongo returned an invalid checkout response:",
        paymongoData
      );

      return NextResponse.json(
        {
          error:
            "Payment checkout could not be created.",
        },
        {
          status: 502,
        }
      );
    }

    /*
     * ---------------------------------------------------------
     * 15. Save checkout ID in our database
     *
     * We create a PENDING payment record.
     *
     * IMPORTANT:
     *
     * We do NOT mark it PAID here.
     *
     * The payment becomes PAID only after PayMongo confirms
     * the successful payment through the webhook.
     * ---------------------------------------------------------
     */

    const payment =
      await prisma.payment.create({
        data: {
          homeownerId: homeowner.id,

          dueId: due.id,

          amount: balance,

          /*
           * The checkout currently allows GCash and Maya.
           *
           * GCASH is used as the initial local value.
           * The webhook will replace this with the actual
           * payment method after PayMongo confirms payment.
           */
          method: "GCASH",

          status: "PENDING",

          paymongoCheckoutId:
            checkoutId,

          updatedAt: new Date(),
        },
      });

    /*
     * ---------------------------------------------------------
     * 16. Return checkout information
     * ---------------------------------------------------------
     */

    return NextResponse.json(
      {
        message:
          "Payment checkout created successfully.",

        payment: {
          id: payment.id,

          amount:
            payment.amount.toString(),

          status:
            payment.status,

          dueId:
            payment.dueId,
        },

        checkout: {
          id: checkoutId,

          url: checkoutUrl,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create homeowner checkout error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create payment checkout.",
      },
      {
        status: 500,
      }
    );
  }
}