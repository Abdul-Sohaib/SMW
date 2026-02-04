// src/pages/Subscription.tsx

const Subscription = () => {
    const plans = [
        {
            duration: '3 Months',
            cost: 41997,
            monthlyCost: 13999,
            description: '3 months subscription per constituency',
        },
        {
            duration: '6 Months',
            cost: 74994,
            monthlyCost: 12499,
            description: '6 months subscription per constituency',
        },
        {
            duration: '12 Months',
            cost: 131988,
            monthlyCost: 10999,
            description: '12 months subscription per constituency',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                        Subscription Plans
                    </h1>
                    <p className="text-sm text-gray-600">
                        Choose a plan that fits your needs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan, index) => (
                        <div key={index} className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-xl font-medium text-gray-900 mb-2">{plan.duration}</h2>
                            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                            <div className="text-2xl font-bold text-blue-600 mb-4">
                                ₹{plan.cost.toLocaleString()}
                                <span className="text-sm text-gray-600"> / per constituency</span>
                            </div>
                            <div className="text-sm text-gray-600 mb-4">
                                (₹{plan.monthlyCost.toLocaleString()} / month)
                            </div>
                            <button className="btn btn-primary w-full">
                                Subscribe Now
                            </button>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Subscription;