import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout';
import { Dashboard, OntologyExplorer, StateMap, ProductMatrix, Simulator, Settings } from '@/pages';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'ontology', element: <OntologyExplorer /> },
      { path: 'states', element: <StateMap /> },
      { path: 'products', element: <ProductMatrix /> },
      { path: 'simulator', element: <Simulator /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);
