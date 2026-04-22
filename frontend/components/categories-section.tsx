'use client'

import Image from 'next/image'

const categories = [
  {
    id: 1,
    name: 'Fashion & Apparel',
    image: '/collage-fashion.jpg',
  },
  {
    id: 2,
    name: 'Groceries & Food',
    image: '/collage-groceries.jpg',
  },
  {
    id: 3,
    name: 'Electronics & Laptops',
    image: '/collage-laptops.jpg',
  },
  {
    id: 4,
    name: 'Home & Furniture',
    image: '/collage-furniture.jpg',
  },
  {
    id: 5,
    name: 'Footwear & Sneakers',
    image: '/collage-sneakers.jpg',
  },
  {
    id: 6,
    name: 'Beauty & Cosmetics',
    image: '/collage-beauty.jpg',
  },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="w-full px-4 py-20">
      {/* Header */}
      <div className="mb-12 max-w-5xl mx-auto flex items-center justify-between">
        <h2 className="text-4xl font-bold text-gray-900">
          Explore Trending Categories
        </h2>
        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
          View all
          <span className="text-lg">→</span>
        </a>
      </div>

      {/* Masonry Collage Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 max-w-5xl mx-auto p-4">
        {/* Left Column */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Item 1: Fashion - h-48 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-48">
            <Image
              src={categories[0].image}
              alt={categories[0].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[0].name}</h3>
            </div>
          </div>

          {/* Item 2: Groceries - h-80 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-80">
            <Image
              src={categories[1].image}
              alt={categories[1].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[1].name}</h3>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Item 3: Laptops - h-64 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-64">
            <Image
              src={categories[2].image}
              alt={categories[2].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[2].name}</h3>
            </div>
          </div>

          {/* Item 4: Furniture - h-64 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-64">
            <Image
              src={categories[3].image}
              alt={categories[3].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[3].name}</h3>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-3 md:gap-4">
          {/* Item 5: Sneakers - h-80 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-80">
            <Image
              src={categories[4].image}
              alt={categories[4].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[4].name}</h3>
            </div>
          </div>

          {/* Item 6: Beauty - h-48 */}
          <div className="relative overflow-hidden rounded-xl group cursor-pointer h-48">
            <Image
              src={categories[5].image}
              alt={categories[5].name}
              fill
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="font-bold text-lg">{categories[5].name}</h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
