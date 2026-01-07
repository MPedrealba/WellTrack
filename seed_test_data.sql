-- Insert 5 fake student users
INSERT INTO users (id, email, firstName, lastName, role, createdAt) VALUES
('user-001', 'alice.johnson@student.welltrack.edu', 'Alice', 'Johnson', 'student', NOW()),
('user-002', 'bob.smith@student.welltrack.edu', 'Bob', 'Smith', 'student', NOW()),
('user-003', 'carol.davis@student.welltrack.edu', 'Carol', 'Davis', 'student', NOW()),
('user-004', 'david.wilson@student.welltrack.edu', 'David', 'Wilson', 'student', NOW()),
('user-005', 'eve.brown@student.welltrack.edu', 'Eve', 'Brown', 'student', NOW());

-- Insert 10 random mood entries
INSERT INTO mood_entries (userId, moodLevel, stressLevel, journalEntry, aiSentiment, aiInsights, createdAt) VALUES
('user-001', 3, 4, 'Feeling a bit stressed about upcoming exams', 'neutral', 'Student shows moderate stress levels. Consider suggesting study techniques.', DATE_SUB(NOW(), INTERVAL 5 DAY)),
('user-002', 4, 2, 'Had a good day, feeling positive', 'positive', 'Good mood indicates healthy state. Encourage maintaining positive habits.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('user-003', 2, 5, 'Really overwhelmed with assignments', 'negative', 'High stress detected. Recommend immediate stress management resources.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('user-004', 5, 1, 'Amazing day, everything went well', 'positive', 'Excellent mood. Student appears to be in good mental health.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('user-005', 3, 3, 'Average day, nothing special', 'neutral', 'Stable mood levels. Monitor for any changes.', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('user-001', 4, 3, 'Better today, managed my time well', 'positive', 'Improvement in mood. Time management strategies are working.', NOW()),
('user-002', 2, 4, 'Feeling down, need some support', 'negative', 'Low mood detected. Consider reaching out for additional support.', DATE_SUB(NOW(), INTERVAL 6 HOUR)),
('user-003', 3, 2, 'Starting to feel better', 'neutral', 'Mood stabilizing. Continue monitoring.', DATE_SUB(NOW(), INTERVAL 12 HOUR)),
('user-004', 4, 2, 'Productive day', 'positive', 'Good productivity and mood. Keep up the good work.', DATE_SUB(NOW(), INTERVAL 18 HOUR)),
('user-005', 1, 5, 'Very stressed, need help', 'negative', 'Critical stress levels. Immediate intervention recommended.', DATE_SUB(NOW(), INTERVAL 6 HOUR));

-- Insert 2 test alerts
INSERT INTO alerts (userId, alertType, reason, isRead, isResolved, createdAt) VALUES
('user-003', 'high_stress', 'Student reported stress level 5 with mood level 2. Immediate attention needed.', false, false, DATE_SUB(NOW(), INTERVAL 3 DAY)),
('user-005', 'critical_stress', 'Student reported stress level 5 with mood level 1. Critical situation requiring immediate support.', false, false, DATE_SUB(NOW(), INTERVAL 6 HOUR));