import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/layout/Layout';
import { ApplyPage }  from './pages/ApplyPage';
import { StatusPage } from './pages/StatusPage';
import { AdminPage }  from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: '14px',
            borderRadius: '10px',
          },
        }}
      />
      <Layout>
        <Routes>
          <Route path="/"       element={<ApplyPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/admin"  element={<AdminPage />} />
          <Route path="*"       element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
