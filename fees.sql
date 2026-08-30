INSERT INTO feesetting
    (type, amount, description, isActive, createdAt, updatedAt)
VALUES
    ('BASKETBALL_COURT', 500.00, 'Basketball Court reservation fee', 1, NOW(), NOW()),
    ('TENNIS_COURT', 500.00, 'Tennis Court reservation fee', 1, NOW(), NOW()),
    ('CLUBHOUSE', 1000.00, 'Clubhouse reservation fee', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
    amount = VALUES(amount),
    description = VALUES(description),
    isActive = VALUES(isActive),
    updatedAt = NOW();
