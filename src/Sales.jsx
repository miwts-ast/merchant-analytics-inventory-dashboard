import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'
import { PuffLoader } from 'react-spinners'

// GRID CONTAINER
function GridContainer({ children, title }) {
    return (
        <div className='grid-cols-1 mb-2.5 items-center h-max bg-page border-2 border-line rounded-md px-5'>
            <h1 className='font-sans font-semibold text-xl p-1 my-2'>{title}</h1>
            {children}
        </div>
    )
}
// CUSTOM TOOLTIP
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: '#fff', padding: 8, border: '1px solid #ccc', borderRadius: '10px', boxShadow: '2px 2px 10px rgba(0,0,0,0.5)' }}>
            <p className='font-extralight text-muted'>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: <b>₦{p.value}</b></p>
            ))}
        </div>
    );
}
// CUSTOM LEGEND
function CustomLegend({ payload }) {
    return (
        <ul>
            {payload.map((entry, i, j) => (
                <>
                    <span key={j} className='absolute -left-3 my-2 -mx-1 w-2.5 h-2.5 rounded-full' style={{ backgroundColor: entry.color }}></span>
                    <li key={i} style={{ color: entry.color }} className='font-semibold'>{entry.value}</li>
                </>
            ))}
        </ul>
    );
}

const Sales = () => {
    const [health, setHealth] = useState([])
    const [sales, setSales] = useState([])
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const [category, setCategory] = useState("All Categories")
    const [payment, setPayment] = useState("All Payment Methods")
    const COLORS = ["#7C3AED", "#06B6D4", "#F472B6"]

    useEffect(() => {
        fetch("/inventory_health.json")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch resource")
                return response.json()
            })
            .then(data => setHealth(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const inventoryHealth = health.map((item) => ({
        category: item.business_category,
        sales: item.net_sales,
        revenue: item.gross_revenue,
        value: Math.round(item.net_sales / 801981.87 * 100),
        color: [...COLORS],
        business: item.business_name,
    }))

    const filteredInventory = useMemo(() => {
        return inventoryHealth.filter((i) => {
            if (category != "All Categories" && i.Category != category) return false
            return true
        })
    }, [category, inventoryHealth])

    useEffect(() => {
        fetch("/sales_summary.json")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch resource")
                return response.json()
            })
            .then(data => setSales(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const salesSummary = sales.flatMap((item) => ({
        month: item.month,
        net_profit: item.net_profit,
        gross_revenue: item.gross_revenue,
        payment: item.payment_method,
        ...(payment !== "All Payment Methods" && {
            [payment]: item.payment_method[payment] ?? 0,
        }),
    }))

    const paymentLabel = {
        pos_card: "POS Card",
        cash: "Cash",
        bank_transfer: "Bank Transfer",
    }
    const paymentColors = {
        pos_card: "#06B6D4",
        cash: "#8a43e5",
        bank_transfer: "green",
    }
    const catColors = {
        Electronics: "#7C3AED",
        Groceries: "#06B6D4",
        Apparel: "#F472B6"
    }

    if (loading) return <PuffLoader loading={loading} color='#2536eb' cssOverride={{ margin: "40px auto", }} />
    if (error) return <p>Error : {error}</p>
    return (
        <>
            <select value={payment} onChange={e => setPayment(e.target.value)} className='bg-card border-2 border-line p-1 font-bold rounded-md ml-2 max-md:ml-0 mb-1 outline-none'>
                <option value="All Payment Methods">All Payment Methods</option>
                <option value="pos_card">POS/Card</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className='bg-card border-2 border-line p-1 font-bold rounded-md mb-1 outline-none'>
                <option value="All Categories">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Apparel">Apparel</option>
                <option value="Groceries">Groceries</option>
            </select>
            {/* LINE CHART */}
            <GridContainer title="Revenue & Profit Trend">
                <ResponsiveContainer width="100%" height={330}>
                    <LineChart data={salesSummary} width={300} height={250}>
                        <Line dataKey='gross_revenue' stroke='#7C3AED' strokeWidth={2} dot={false} name='Gross Revenue' />
                        <Line dataKey='net_profit' stroke='#2536eb' strokeWidth={2} dot={false} name='Net Profit' />
                        {payment !== "all" && (
                            <Line
                                type="monotone"
                                dataKey={payment}
                                name={paymentLabel[payment]}
                                stroke={paymentColors[payment]}
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot
                            />
                        )}
                        <CartesianGrid strokeOpacity={0.5} strokeDasharray='3 3' />
                        <XAxis dataKey="month" opacity={0.5} tick={{ fontSize: 11, fill: 'gray' }} tickLine={false} />
                        <YAxis dataKey="gross_revenue" tickFormatter={(v) => `\u20A6${v}`} opacity={0.5} tick={{ fontSize: 11, fill: "gray" }} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                    </LineChart>
                </ResponsiveContainer>
            </GridContainer>
            {/* PIE CHART */}
            <GridContainer title="Sales By Category">
                <div>
                    <ResponsiveContainer width="100%" height={210}>
                        <PieChart data={filteredInventory}>
                            <Pie dataKey="sales" paddingAngle={1} innerRadius={50} outerRadius={100} nameKey="Category">
                                {filteredInventory.map((entry, index) => (
                                    <Cell key={entry.category} fill={catColors[entry.category] ?? COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="relative -top-32 text-center pointer-events-none flex flex-col justify-center items-center">
                    <div className="font-bold text-muted-900 text-lg">&#8358;793K</div>
                    <div className="text-xs text-muted-400">Net Sales</div>
                </div>
                <div className="space-y-2">
                    {inventoryHealth.map((i, index) => (
                        <div key={i.category} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-muted-600">
                                <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[index % COLORS.length] }} />
                                <b style={{ color: COLORS[index % COLORS.length] }}>{i.business}</b> ({i.category})
                            </span>
                            <span className="text-muted-800 font-medium">{i.value}%</span>
                        </div>
                    ))}
                </div>
            </GridContainer>
        </>
    )
}

export default Sales