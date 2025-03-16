/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import "solid-devtools";

import HomeView from "./routes/home";
import SearchView from "./routes/search";

const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Route path="/" component={HomeView} />
      <Route path="/search" component={SearchView} />
    </Router>
  ),
  root!,
);
