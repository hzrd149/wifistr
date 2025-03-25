import "./lib/leaflet";
import { render } from "solid-js/web";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import { Toaster } from "solid-toast";
import "solid-devtools";

import "./services/lifestyle";

import HomeView from "./routes/home";
import SearchView from "./routes/search";
import CreateWifiView from "./routes/create";
import ScanQrCodeView from "./routes/scan";
import WelcomeView from "./routes/welcome";
import SigninView from "./routes/signin";
import SettingsView from "./routes/settings";
import ProfileView from "./routes/profile";
import NotFoundView from "./routes/404";
import WifiView from "./routes/wifi";
import ProfileNetworks from "./routes/profile/networks";
import WifiEditView from "./routes/wifi/edit";
import WifiListView from "./routes/list";

const root = document.getElementById("root");

render(
  () => (
    <>
      <Toaster />
      <Router base={import.meta.env.BASE_URL}>
        <Route path="/" component={HomeView} />
        <Route path="/search" component={SearchView} />
        <Route path="/create" component={CreateWifiView} />
        <Route path="/scan" component={ScanQrCodeView} />
        <Route path="/welcome" component={WelcomeView} />
        <Route path="/signin" component={SigninView} />
        <Route path="/settings" component={SettingsView} />
        <Route path="/profile" component={ProfileView} />
        <Route path="/profile/:pubkey" component={ProfileView} />
        <Route path="/profile/:pubkey/networks" component={ProfileNetworks} />
        <Route path="/list" component={WifiListView} />
        <Route path="/wifi/:naddr" component={WifiView} />
        <Route path="/wifi/:naddr/edit" component={WifiEditView} />
        <Route path="*" component={NotFoundView} />
      </Router>
    </>
  ),
  root!,
);
