import { FaRegLightbulb, FaDollarSign, FaBell, FaCartShopping } from 'react-icons/fa6'
import { BiTrendingUp } from 'react-icons/bi'

const Insight = () => {
    return (
        <div className='bg-card m-2 px-3 py-1.5 rounded-md border-2 border-line relative'>
            <h1 className='font-bold text-xl p-2'><FaRegLightbulb size={20} color='#2563eb' className='inline mr-2' />Key Insights</h1>
            <span className='absolute right-2.5 -mt-8 bg-blue-200 text-blue-600 tracking-tight text-sm rounded-xl px-1.5 py-1 font-semibold'>AI Powered</span>
            <div className='flex gap-5 items-center my-2'>
                <div className='bg-green-200 p-3 inline-flex rounded-full'>
                    <FaDollarSign size={25} className='bg-green-600 text-white rounded-full p-1' />
                </div>
                <p className='tracking-tight leading-snug mb-0.5'>Gross revenue capped at <b>&#8358;801,981</b> (the highest so far). <br />
                    Your best performing category is Electronics (66.8%).
                </p>
            </div>
            <div className='flex gap-5 items-center my-2'>
                <div className='bg-purple-200 p-3 inline-flex rounded-full'>
                    <BiTrendingUp size={25} className='bg-purple-600 text-white rounded-full p-1' />
                </div>
                <p className='tracking-tight leading-snug mb-0.5'>Net Profit Margin increased to <b>27.89%</b> which is 3.2% higher than last month. <br />
                    Keep monitoring stock count.
                </p>
            </div>
            <div className='flex gap-5 items-center my-2'>
                <div className='bg-amber-200 p-3 inline-flex rounded-full'>
                    <FaBell size={25} className='bg-amber-600 text-white rounded-full p-1' />
                </div>
                <p className='tracking-tight leading-snug mb-0.5'><b>11</b> items are below the low stock threshold. <br />
                    Consider restocking to avoid  lost sales.
                </p>
            </div>
            <div className='flex gap-5 items-center my-2'>
                <div className='bg-blue-200 p-3 inline-flex rounded-full'>
                    <FaCartShopping size={25} className='bg-blue-600 text-white rounded-full p-1' />
                </div>
                <p className='tracking-tight leading-snug mb-0.5'>Average Order Value increased by <b>8.7%</b>. <br />
                    Your pricing strategy is working well!
                </p>
            </div>
        </div>
    )
}

export default Insight