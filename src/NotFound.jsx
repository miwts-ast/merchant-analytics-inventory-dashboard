import { AiFillWarning } from 'react-icons/ai'
import Side from './Side'

const NotFound = () => {
    return (
        <Side>
            <div className='flex flex-col min-h-screen items-center justify-center'>
                <AiFillWarning size={100} className='text-red-600' />
                <h1 className='text-2xl font-semibold'>The requested resource was not found</h1>
            </div>
        </Side>
    )
}

export default NotFound