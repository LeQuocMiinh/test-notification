
CREATE TABLE register (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deviceId TEXT NOT NULL,
    appId TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    voipToken TEXT NOT NULL,
    platform INTEGER NOT NULL,
    status TEXT,
    geocode TEXT NOT NULL,
    updateTimeLow INTEGER,
    updateTimeHigh INTEGER,
    updateTimeUnsigned BOOLEAN
);

CREATE TABLE subscribe (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT NOT NULL,
    deviceToken TEXT NOT NULL,
    FOREIGN KEY (deviceToken) REFERENCES register(token)
);

