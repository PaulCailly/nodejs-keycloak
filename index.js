var express = require("express");
var session = require("express-session");
var bodyParser = require("body-parser");
var Keycloak = require("keycloak-connect");
var cors = require("cors");

var app = express();
app.use(bodyParser.json());

// Enable CORS support
app.use(cors());

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

var memoryStore = new session.MemoryStore();

app.use(
  session({
    secret: "some secret",
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  })
);

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

var keycloak = new Keycloak({
  store: memoryStore,
});

app.use(
  keycloak.middleware({
    logout: "/logout",
    admin: "/",
  })
);

app.get("/public", function (_req, res) {
  res.json({ message: "public" });
});

app.get("/protected", keycloak.protect("realm:user"), function (_req, res) {
  res.json({ message: "secured" });
});

app.get("/admin", keycloak.protect("realm:admin"), function (_req, res) {
  res.json({ message: "admin" });
});

app.use("*", function (_req, res) {
  res.send("Not found!");
});

app.listen(8000, function () {
  console.log("Started at port 8000");
});
