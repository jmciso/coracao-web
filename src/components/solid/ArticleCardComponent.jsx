
const ArticleCard = ({id, title, description, image }) => (
  <div class="bg-white p-6 rounded-lg shadow-md">
    <img src={image} alt={title} class="w-full h-48 object-cover rounded-t-lg" />
    <h3 class="text-lg font-medium mt-4">{title}</h3>
    <p class="text-gray-600 mt-2">{description}</p>
  </div>
);
export default ArticleCard;

// render(() => <ArticleList />, document.getElementById('root'));
