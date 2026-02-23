
import { BrowserRouter } from 'react-router'
import GlobalRoutes from './Routes/GlobalRoutes'
import { createRoot } from 'react-dom/client'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <GlobalRoutes/>
  </BrowserRouter>

)
