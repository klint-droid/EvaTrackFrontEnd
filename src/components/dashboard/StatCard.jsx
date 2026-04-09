const StatCard = ({ title, value }) => {
    return (
         <div className="bg-white shadow rounded-2xl p-5">
            <h4 className="text-gray-500 text-sm">{title}</h4>
            <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
    )
};

export default StatCard;