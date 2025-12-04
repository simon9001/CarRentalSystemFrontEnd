import React from 'react'
import Navbar from '../Componnents/Navbar'
import Footer from '../Componnents/Footer'

const About: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-green-800 text-white py-16 px-8 text-center">
                <h1 className="text-6xl mb-4 font-bold">
                    🍽️ About Mathe's EATERY
                </h1>
                <p className="text-xl max-w-3xl mx-auto leading-relaxed opacity-90">
                    A culinary journey that began with passion, tradition, and a dream to bring authentic flavors to your table.
                </p>
            </div>

            {/* Our Story Section */}
            <div className="py-16 px-8 bg-white">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-4xl text-green-800 mb-6 font-bold">
                            📖 Our Story
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Founded in 2018, Mathe's EATERY started as a small family kitchen with big dreams.
                            What began as Grandmother Mathe's secret recipes shared among friends has blossomed
                            into a beloved restaurant that serves the community with heart and soul.
                        </p>
                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            Every dish we serve tells a story - from our signature spice blends passed down through
                            generations to our innovative fusion creations that celebrate diverse culinary traditions.
                            We believe food is more than sustenance; it's a way to connect, celebrate, and create memories.
                        </p>
                    </div>
                    <div className="text-center">
                        <img
                            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                            alt="Restaurant Interior"
                            className="w-full max-w-lg rounded-2xl shadow-xl h-80 object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-16 px-8 bg-gray-50">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl text-green-800 mb-4 font-bold">
                        ✨ Our Values
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        What drives us every day to create exceptional dining experiences
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🌱',
                                title: 'Fresh & Local',
                                description: 'We source our ingredients from local farmers and suppliers, ensuring freshness and supporting our community.'
                            },
                            {
                                icon: '❤️',
                                title: 'Made with Love',
                                description: 'Every dish is prepared with care, attention to detail, and a genuine passion for exceptional food.'
                            },
                            {
                                icon: '🤝',
                                title: 'Community',
                                description: 'We believe in giving back to our community and creating a welcoming space for everyone.'
                            }
                        ].map((value, index) => (
                            <div
                                key={index}
                                className="bg-white p-8 rounded-2xl shadow-lg transition-transform duration-300 cursor-pointer hover:-translate-y-2"
                            >
                                <div className="text-5xl mb-4">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl text-green-800 mb-4 font-bold">
                                    {value.title}
                                </h3>
                                <p className="text-base text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Meet the Team Section */}
            <div className="py-16 px-8 bg-white">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl text-green-800 mb-4 font-bold">
                        👥 Meet Our Team
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
                        The passionate people behind your delicious meals
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                name: 'Chef Mathe Lucy',
                                role: 'Head Chef & Founder',
                                image: 'https://images.unsplash.com/photo-1556911073-52527ac43761?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1470',
                                description: 'With 15 years of culinary expertise, Chef Mathe brings traditional recipes to life with modern techniques.'
                            },
                            {
                                name: 'Chef Mathe Jane',
                                role: 'Pastry Chef',
                                image: 'https://plus.unsplash.com/premium_photo-1661768360749-b60196445a6d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mjl8fGNvb2t8ZW58MHx8MHx8fDA%3D%3D&auto=format&fit=crop&q=80&w=1470',
                                description: 'Our talented pastry chef creates heavenly desserts that perfectly complement our savory offerings.'
                            },
                            {
                                name: 'Chef Mathe Nancy',
                                role: 'Restaurant Manager',
                                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
                                description: 'Nancy ensures every guest feels welcome and enjoys an exceptional dining experience from start to finish.'
                            },
                            {
                                name: 'Chef Amara ',
                                role: 'Sous Chef',
                                image: 'https://images.unsplash.com/photo-1625631980683-825234bfb7d5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=687',
                                description: 'Amara specializes in fusion cuisine and brings creative innovation to our traditional menu offerings.'
                            }
                        ].map((member, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 cursor-pointer hover:-translate-y-2"
                            >
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl text-green-800 mb-2 font-bold">
                                        {member.name}
                                    </h3>
                                    <p className="text-base text-amber-600 mb-4 font-semibold">
                                        {member.role}
                                    </p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {member.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Fun Facts Section */}
            <div className="py-16 px-8 bg-gray-50">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-4xl text-green-800 mb-4 font-bold">
                        🎉 Fun Facts About Us
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
                        {[
                            { number: '50,000+', label: 'Happy Customers' },
                            { number: '150+', label: 'Delicious Recipes' },
                            { number: '5★', label: 'Average Rating' },
                            { number: '24/7', label: 'Food Passion' }
                        ].map((fact, index) => (
                            <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                                <div className="text-4xl font-bold text-green-800 mb-2">
                                    {fact.number}
                                </div>
                                <p className="text-lg text-gray-600 font-medium">
                                    {fact.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Call to Action Section */}
            <div className="py-16 px-8 bg-green-800 text-white text-center">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-4xl mb-4 font-bold">
                        🌟 Ready to Experience Mathe's Magic?
                    </h2>
                    <p className="text-xl mb-8 leading-relaxed opacity-90">
                        Join us for an unforgettable dining experience. Whether it's a casual lunch,
                        romantic dinner, or special celebration, we're here to make it memorable.
                    </p>

                    <div className="flex gap-4 justify-center flex-wrap">
                        <button className="bg-white text-green-800 px-8 py-4 border-none rounded-full text-lg font-bold cursor-pointer transition-all duration-300 flex items-center gap-2 hover:-translate-y-1 hover:shadow-lg">
                            🍽️ View Our Menu
                        </button>

                        <button className="bg-transparent text-white px-8 py-4 border-2 border-white rounded-full text-lg font-bold cursor-pointer transition-all duration-300 flex items-center gap-2 hover:bg-white hover:text-green-800">
                            📞 Contact Us
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default About