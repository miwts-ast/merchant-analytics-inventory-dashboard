import { BiTrendingUp } from "react-icons/bi"
import { FaCube, FaDollarSign } from "react-icons/fa"
import { FaCartShopping, FaArrowUp } from "react-icons/fa6"
import { useState, useEffect, useMemo } from 'react'
import { PuffLoader } from "react-spinners"
import Sales from "./Sales"
import Inventory from './Inventory'
import Insight from "./Insight"

function Card({ icon: Icon, iconBg, iconColor, label, value, change }) {
    return (
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm my-2 overflow-hidden">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconBg} ${iconColor}`}>
                <Icon size={18} />
            </div>
            <div className="text-sm text-gray-500">{label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium mt-2">
                <FaArrowUp size={12} />
                {change}
                <span className="text-gray-400 font-normal">vs previous month</span>
            </div>
        </div>
    );
}

const Dashboard = () => {
    const [report, setReport] = useState([])
    const [summary, setSummary] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [month, setMonth] = useState("")

    useEffect(() => {
        fetch("/validation_report.json")
            .then((response) => {
                if (!response) throw new Error("Failed to fetch resource")
                return response.json()
            })
            .then(data => setReport(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        fetch("/sales_summary.json")
            .then((response) => {
                if (!response.ok) throw new Error('Failed to fetch resource')
                return response.json()
            })
            .then(data => setSummary(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const salesSummary = summary.map((item) => ({
        gross_revenue: item.gross_revenue,
        month: item.month,
        net_sales: item.net_sales
    }))

    const filteredDates = useMemo(() => {
        return salesSummary.filter((i) => {
            if (month != "All" && i.month != month) return false
            return true
        })
    }, [month, salesSummary])


    const gross = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(report.gross_revenue)
    const AOV = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(report.average_transaction_value)
    const sales = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(report.net_sales)
    const profitMargin = report.net_margin_pct

    const monthlyGross = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(filteredDates.map((i) => (i.gross_revenue)))
    const monthlySales = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(filteredDates.map((i) => (i.net_sales)))

    if (loading) return <PuffLoader loading={loading} color="#2536eb" cssOverride={{ margin: "40px auto", display: "flex", height: 100, alignItems: "center", justifyContent: "center" }} />
    if (error) return <p>Error: {error}</p>

    return (
        <>
            <div className="px-2.5">
                <div className="flex gap-2.5 justify-between items-center max-md:block">
                    <span>
                        <h1 className="text-xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-500">Turn your sales and inventory data into actionable sights.</p>
                    </span>
                    <div >
                        <select value={month} onChange={e => setMonth(e.target.value)} className='bg-white border-2 border-gray-200 p-1 font-bold rounded-md'>
                            <option value="">All</option>
                            <option value="2026-09">Sep 1, 2026 - Sep 30, 2026</option>
                            <option value="2026-08">Aug 1, 2026 - Aug 31, 2026</option>
                            <option value="2026-07">Jul 1, 2026 - Jul 31, 2026</option>
                            <option value="2026-05">May 1, 2026 - May 31, 2026</option>
                            <option value="2026-04">Apr 1, 2026 - Apr 30, 2026</option>
                            <option value="2026-01">Jan 1, 2026 - Jan 31, 2026</option>
                        </select>
                    </div>
                </div>
                {console.log(filteredDates)}
                <div className="grid grid-cols-4 gap-4 mb-4 overflow-hidden max-md:block">
                    <Card icon={FaDollarSign} iconBg="bg-green-100" iconColor="text-green-600" label="Gross Revenue" value={monthlyGross || gross} change="12.5%" />
                    <Card icon={BiTrendingUp} iconBg="bg-purple-100" iconColor="text-purple-600" label="Net Profit Margin" value={`${profitMargin}%`} change="3.2%" />
                    <Card icon={FaCartShopping} iconBg="bg-blue-100" iconColor="text-blue-600" label="Average Order Value" value={AOV} change="8.7%" />
                    <Card icon={FaCube} iconBg="bg-orange-100" iconColor="text-orange-600" label="Net Sales" value={monthlySales || sales} change="15.8%" />
                </div>
            </div>

            <div className="md:grid grid-cols-2 gap-2.5 mx-2.5">
                <Sales />
            </div>

            <div className="block md:grid grid-cols-2 gap-2.5">
                <Inventory limit={true} max={4} className="max-md:overflow-x-scroll max-xl:overflow-x-scroll" />
            </div>

            <Insight />
        </>
    )
}

export default Dashboard