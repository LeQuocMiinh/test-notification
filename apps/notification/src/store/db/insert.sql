INSERT INTO register (
    deviceId, appId, token, voipToken, platform, status, geocode, updateTimeLow, updateTimeHigh, updateTimeUnsigned
) VALUES
('device124', 'app457', 'token790', 'voipTokenDEF', 2, 'inactive', 'VN-HCM', 1234567892, 1234567893, 0),
('device125', 'app458', 'token791', 'voipTokenGHI', 1, 'active', 'VN-DN', 1234567894, 1234567895, 1);


INSERT INTO subscribe (channelId, deviceToken) 
VALUES 
('channel002', 'token790'),
('channel003', 'token791');
