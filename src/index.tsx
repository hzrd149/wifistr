import "./lib/leaflet";
import { render } from "solid-js/web";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import "solid-devtools";

import HomeView from "./routes/home";
import SearchView from "./routes/search";
import CreateWifiView from "./routes/create";
import ScanQrCodeView from "./routes/scan";
import WelcomeView from "./routes/welcome";
import SigninView from "./routes/signin";
import SettingsView from "./routes/settings";
import ProfileView from "./routes/profile";

const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Route path="/" component={HomeView} />
      <Route path="/search" component={SearchView} />
      <Route path="/create" component={CreateWifiView} />
      <Route path="/scan" component={ScanQrCodeView} />
      <Route path="/welcome" component={WelcomeView} />
      <Route path="/signin" component={SigninView} />
      <Route path="/settings" component={SettingsView} />
      <Route path="/profile" component={ProfileView} />
    </Router>
  ),
  root!,
);
