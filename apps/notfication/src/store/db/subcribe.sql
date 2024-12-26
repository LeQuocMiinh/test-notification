/**npx wrangler d1 execute prod-d1-tutorial --remote --file ./src/store/db/subcribe.sql **/
CREATE TABLE subscription (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT NOT NULL,
    deviceToken TEXT NOT NULL,
    deviceType TEXT NOT NULL
); 
