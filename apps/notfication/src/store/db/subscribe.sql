CREATE TABLE register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId TEXT NOT NULL,
    appId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    voipToken TEXT NOT NULL,
    platform INTEGER NOT NULL,
    status TEXT,
    geocode TEXT NOT NULL,
    updateTimeLow INTEGER NOT NULL,
    updateTimeHigh INTEGER NOT NULL,
    updateTimeUnsigned BOOLEAN NOT NULL
);

CREATE TABLE subscribe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT NOT NULL,
    deviceToken TEXT NOT NULL,
    deviceType TEXT NOT NULL,
    FOREIGN KEY (deviceToken) REFERENCES register(token)
);
