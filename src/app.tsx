import {MetaProvider, Title} from "@solidjs/meta";
import {Router} from "@solidjs/router";
import {FileRoutes} from "@solidjs/start/router";
import {onMount, Suspense} from "solid-js";
import "./app.css";
import {initializeStore} from "~/store/appState";

export default function App() {
    onMount(() => {
        initializeStore();
    });

    return (
        <Router
            root={(props) => (
                <MetaProvider>
                    <Title>Zello</Title>
                    <Suspense>{props.children}</Suspense>
                </MetaProvider>
            )}
        >
            <FileRoutes/>
        </Router>
    );
}
