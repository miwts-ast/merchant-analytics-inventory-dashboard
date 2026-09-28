import { Outlet } from 'react-router-dom'
import Side from './Side'

const Layout = () => {
  return (
    <>
      <main>
        <Side>
          <Outlet />
        </Side>
      </main>
    </>
  )
}

export default Layout