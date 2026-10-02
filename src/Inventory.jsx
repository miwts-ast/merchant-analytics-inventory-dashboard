import { useState, useEffect } from 'react'
import { PuffLoader } from 'react-spinners'
import { AiFillWarning } from 'react-icons/ai'
import { FaCube, FaBatteryHalf } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// CUSTOM TOOLTIP
function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ padding: 8, borderRadius: '10px', boxShadow: '2px 2px 10px rgba(0,0,0,0.5)' }} className='bg-card border-line'>
            <p className='font-semibold text-muted'>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
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

function Overview() {
    const [products, setProducts] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch("/inventory_products.json")
            .then((response) => {
                if (!response) throw new Error("Failed to fetch resource")
                return response.json()
            })
            .then(data => setProducts(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const businessHealth = (products?.business_health ?? []).map(item => ({
        id: item.business_id,
        product_count: item.product_count,
        inventory_value: item.inventory_value,
        low_stock_count: item.low_stock_count,
        negative_stock_count: item.negative_stock_count,
        zero_stock_count: item.zero_stock_count,
    }))


    if (loading) return <PuffLoader loading={loading} color='#2536eb' cssOverride={{ margin: "40px auto" }} />
    if (error) return <p>Error: {error}</p>
    return (
        <div className='border-2 border-line rounded-md ml-2 px-2 bg-card'>
            <h1 className='text-xl font-bold p-2'>Inventory Overview</h1>
            <div className='grid grid-cols-3 gap-2.5'>
                <OverviewCard bgColor="bg-primary-tint" icon={FaCube} iconColor="text-primary-on-tint" label="Total Stock" value={products.total_unique_products} />
                <OverviewCard bgColor="bg-warning-tint" icon={FaBatteryHalf} iconColor="text-warning" label="Low Stock Count" value={products.low_stock_count} />
                <OverviewCard bgColor="bg-danger-tint" icon={AiFillWarning} iconColor="text-danger" label="Negative Stock Count" value={products.negative_stock_count} />
            </div>
            {/* BAR CHART */}
            <ResponsiveContainer width="100%" height={300} className='mt-2 mx-2.5 px-5'>
                <BarChart data={businessHealth}>
                    <Bar dataKey='low_stock_count' fill='#7C3AED' name='Low Stock Count' />
                    <Bar dataKey="product_count" fill='#06B6D4' name='Product Count' />
                    <Bar dataKey="negative_stock_count" fill='#F472B6' name='Negative Stock Count' />
                    <Bar dataKey="zero_stock_count" fill='#FBBF24' name='Zero Stock Count' />
                    <CartesianGrid strokeDasharray='2 2' />
                    <XAxis dataKey="id" tickLine={false} />
                    <YAxis tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={<CustomLegend />} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

function Inventory({ limit = false, max, className }) {
    const [product, setProduct] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch("/monthly_trends.json")
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch resource")
                return response.json()
            })
            .then(data => setProduct(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <PuffLoader loading={loading} color='#2536eb' cssOverride={{ margin: "40px auto" }} />
    if (error) return <p>Error: {error}</p>

    const columns = ['Product', 'Category', 'Stock Level', 'Threshold', 'Status', 'Action']
    const processed = product.map(item => ({
        id: item.product_id,
        Product: item.product_name,
        category: item.product_category,
        "Stock Level": item.current_stock_level,
        threshold: item.low_stock_threshold ? item.low_stock_threshold : "None",
        status: item.system_status,
        Action: <button className='cursor-pointer rounded-md bg-primary px-4 py-2 text-white hover:bg-primary-hover'>Restock</button>
    }))
    const rows = limit ? [...processed].slice(0, max) : [...processed]
        .sort((a, b) => a.Product.localeCompare(b.Product))
        .map(prod => ({
            ...prod,
            status: prod.status.toUpperCase()
        }))

    const statusStyles = {
        ACTIVE: { background: "#d4f7dc", color: "#1a7d3a", border: "1px solid #7ee2a0", fontWeight: 600 },
        PENDING: { background: "#fff3cd", color: "#8a6d00", border: "1px solid #ffe08a", fontWeight: 600 },
        DISABLED: { background: "#fddede", color: "#c62828", border: "1px solid #f5a3a3", fontWeight: 600 }
    };

    const categoryStyles = {
        Groceries: { background: "#e6f4ea", color: "#8a43e5", fontWeight: 500 },
        Electronics: { background: "#e3f0ff", color: "#1565c0", fontWeight: 500 },
        Apparel: { background: "#f3e8ff", color: "#fc578b", fontWeight: 500 }
    };

    function StatusBadge({ status }) {
        const style = statusStyles[status] || { background: "#eee", color: "#333" };
        return (
            <span
                style={{
                    ...style,
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 12,
                    display: "inline-block"
                }}
            >
                {status}
            </span>
        );
    }

    function CategoryBadge({ category }) {
        const style = categoryStyles[category] || { background: "#eee", color: "#333" };
        return (
            <span
                style={{
                    ...style,
                    padding: "3px 8px",
                    borderRadius: 6,
                    fontSize: 13,
                    display: "inline-block"
                }}
            >
                {category}
            </span>
        );
    }
    return (
        <>
            <div style={{ margin: "10px 5px", padding: "0 5px", fontFamily: "system-ui, sans-serif" }} className={`${className} max-[640px]:overflow-x-scroll bg-card`}>
                <span className='flex gap-2.5 justify-between items-center'>
                    <h1 className='text-xl font-bold p-1'>Low Stock Alerts</h1>
                    {limit ? <Link to="/inventory" className='text-primary font-semibold'>View All→</Link> : null}
                </span>
                <table style={{ width: "100%" }} className='border-2 border-gray-200'>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col} style={{ padding: "8px 12px", textAlign: "left" }} className='bg-thead text-white'>
                                    {col.charAt(0).toUpperCase() + col.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id}>
                                {columns.map(col => {
                                    let content = row[col];
                                    if (col === "Category") content = <CategoryBadge category={row.category} />;
                                    if (col === "Status") content = <StatusBadge status={row.status} />;
                                    if (col === "Threshold") content = row.threshold ?? "None";
                                    return (
                                        <td key={col} style={{ border: "1px solid #ddd", padding: "8px 12px" }}>
                                            {content}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Overview />
        </>
    )
}

function OverviewCard({ bgColor, icon: Icon, iconColor, label, value }) {
    return (
        <div className={`rounded-md p-3 shadow-md ${bgColor}`}>
            <Icon size={30} className={`${iconColor}`} />
            <div>
                <h1 className='text-ink'>{label}</h1>
                <p className='font-bold text-ink'>{value}</p>
            </div>
        </div>
    )
}
export default Inventory