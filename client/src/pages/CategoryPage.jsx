import { link } from 'react-router-dom'

const CategoryPage = () => {

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => (
          <div key={category.id} className={`p-6 rounded-lg shadow-lg ${category.bgAccent}`}>
            <div className={`flex items-center space-x-4 ${category.color} text-white`}>
              <span className="text-4xl">{category.icon}</span>
              <div>
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <p className="text-sm">{category.description}</p>
                <span className="text-xs text-gray-300">{category.productCount} products</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CategoryPage;