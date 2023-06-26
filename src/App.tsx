import React from 'react';
import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MicroFrontendId } from './app.types';
import { requestPluginRerender } from './state/scigateway.actions';
import Preloader from './preloader/preloader.component';
import IMSThemeProvider from './imsThemeProvider.component';

import { BrowserRouter } from 'react-router-dom';
import ViewTabs from './view/viewTabs.component';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
    },
  },
});

const App: React.FunctionComponent = () => {
  // we need to call forceUpdate if SciGateway tells us to rerender
  // but there's no forceUpdate in functional components, so this is the hooks equivalent
  // see https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, forceUpdate] = React.useReducer((x) => x + 1, 0);

  function handler(e: Event): void {
    // attempt to re-render the plugin if we get told to
    const action = (e as CustomEvent).detail;
    if (requestPluginRerender.match(action)) {
      forceUpdate();
    }
  }

  React.useEffect(() => {
    document.addEventListener(MicroFrontendId, handler);
    return () => {
      document.removeEventListener(MicroFrontendId, handler);
    };
  }, []);

  return (
    <div className="App">
      <IMSThemeProvider>
        <QueryClientProvider client={queryClient}>
          <React.Suspense
            fallback={<Preloader loading={true}>Finished loading</Preloader>}
          >
            <BrowserRouter>
              <ViewTabs />
            </BrowserRouter>
          </React.Suspense>
        </QueryClientProvider>
      </IMSThemeProvider>
    </div>
  );
};

export default App;
