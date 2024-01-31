import React from 'react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LocalizationProvider } from '@mui/x-date-pickers';

import handleIMS_APIError from './handleIMS_APIError';
import { AxiosError } from 'axios';
import retryIMS_APIErrors from './retryIMS_APIErrors';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { enGB } from 'date-fns/locale/en-GB';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import { MicroFrontendId } from './app.types';
import IMSThemeProvider from './imsThemeProvider.component';
import Preloader from './preloader/preloader.component';
import { requestPluginRerender } from './state/scigateway.actions';
import ViewTabs from './view/viewTabs.component';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleIMS_APIError(error as AxiosError);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 300000,
      retry: (failureCount, error) => {
        return retryIMS_APIErrors(failureCount, error as AxiosError);
      },
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
      <BrowserRouter>
        <LocalizationProvider adapterLocale={enGB} dateAdapter={AdapterDateFns}>
          <IMSThemeProvider>
            <QueryClientProvider client={queryClient}>
              <React.Suspense
                fallback={
                  <Preloader loading={true}>Finished loading</Preloader>
                }
              >
                <ViewTabs />
                {/* <ReactQueryDevtools initialIsOpen={false} /> */}
              </React.Suspense>
            </QueryClientProvider>
          </IMSThemeProvider>
        </LocalizationProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
