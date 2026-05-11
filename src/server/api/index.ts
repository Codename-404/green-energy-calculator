import { Hono } from "hono";
import solar from "./routes/solar";
import weather from "./routes/weather";
import geocode from "./routes/geocode";

const app = new Hono().basePath("/api");

app.route("/solar", solar);
app.route("/weather", weather);
app.route("/geocode", geocode);

export default app;
