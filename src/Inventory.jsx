import { useState, useEffect } from 'react'
import { PuffLoader } from 'react-spinners'
import { AiFillWarning } from 'react-icons/ai'
import { FaCube, FaBatteryHalf } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
// import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function Overview() {
    const [products, setProducts] = useState([])
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

    // console.log(products)
    const businessHealth = products.business_health.map((item) => ({
        id: item.business_id,
        product_count: item.product_count,
        inventory_value: item.inventory_value,
        low_stock_count: item.low_stock_count,
        negative_stock_count: item.negative_stock_count,
        zero_stock_count: item.zero_stock_count
    }))

    // const businessHealth = products.business_health
    // console.log(businessHealth)

    if (loading) return <PuffLoader loading={loading} color='#2536eb' cssOverride={{ margin: "40px auto" }} />
    if (error) return <p>Error: {error}</p>
    return (
        <div className='border-2 border-gray-200 rounded-md pb-2 ml-2 px-2 bg-white'>
            <h1 className='text-xl font-bold p-2'>Inventory Overview</h1>
            <div className='grid grid-cols-3 gap-2.5'>
                <OverviewCard bgColor="bg-green-200" icon={FaCube} iconColor="green" label="Total Stock" value={products.total_unique_products} />
                <OverviewCard bgColor="bg-amber-200" icon={FaBatteryHalf} iconColor="gray" label="Low Stock Count" value={products.low_stock_count} />
                <OverviewCard bgColor="bg-red-200" icon={AiFillWarning} iconColor="red" label="Negative Stock Count" value={products.negative_stock_count} />
            </div>

            {/* <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={businessHealth}>
                    <Area dataKey='inventory_value' stroke='blue' />
                    <CartesianGrid />
                    <XAxis />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                </AreaChart>
            </ResponsiveContainer> */}

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
                if (!response) throw new Error("Failed to fetch resource")
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
        Category: item.product_category,
        "Stock Level": item.current_stock_level,
        "Threshold": item.low_stock_threshold ? item.low_stock_threshold : "None",
        Status: item.system_status,
        Action: <button className='cursor-pointer p-1.5 text-white bg-blue-600 rounded-md font-bold hover:bg-blue-500'>Restock</button>,
    }))
    const rows = limit ? [...processed].slice(0, max) : [...processed]
        .sort((a, b) => a.Product.localeCompare(b.Product))
        .map(prod => ({
            ...prod,
            Status: prod.Status.toUpperCase()
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
            <div style={{ maxWidth: 500, margin: "10px 5px", padding: "0 5px", fontFamily: "system-ui, sans-serif" }} className={`${className} max-[640px]:overflow-x-scroll`}>
                <span className='flex gap-2.5 justify-between items-center'>
                    <h1 className='text-xl font-bold p-1'>Low Stock Alerts</h1>
                    {limit ? <Link to="/inventory" className='text-blue-800 font-semibold'>View All→</Link> : null}
                </span>

                <table style={{ width: "100%" }} className='border-2 border-gray-200'>
                    <thead>
                        <tr>
                            {columns.map(col => (
                                <th key={col} style={{ padding: "8px 12px", textAlign: "left", background: "#1777fd", color: "#fff" }}>
                                    {col.charAt(0).toUpperCase() + col.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.id} style={{ background: i % 2 === 1 ? "#fafafa" : "transparent" }}>
                                {columns.map(col => {
                                    let content = row[col];
                                    if (col === "Category") content = <CategoryBadge category={row.Category} />;
                                    if (col === "Status") content = <StatusBadge status={row.Status} />;
                                    if (col === "Threshold") content = row.Threshold ?? "None";
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
            <Icon size={30} color={`${iconColor}`} />
            <div>
                <h1 className='text-gray-800'>{label}</h1>
                <p className='font-bold text-lg'>{value}</p>
            </div>
        </div>
    )

}
export default Inventory