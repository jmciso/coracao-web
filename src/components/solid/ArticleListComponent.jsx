import { createEffect, createSignal } from 'solid-js';
import ArticleCard from './ArticleCardComponent';
import ArticleService from './../../services/blog.service'
import {getAssetURL} from './../../utils/utils'

// const ArticleCard = ({ title, description, image }) => (
//   <div class="bg-white p-6 rounded-lg shadow-md">
//     <img src={image} alt={title} class="w-full h-48 object-cover rounded-t-lg" />
//     <h3 class="text-lg font-medium mt-4">{title}</h3>
//     <p class="text-gray-600 mt-2">{description}</p>
//   </div>
// );

const ArticleList = () => {
  const [articles, setArticles] = createSignal([]);

  createEffect(() => {
    ArticleService.getArticles()
      .then((data) => setArticles(data));
  }, []);

  return (
    <div class="container mx-auto py-4">
      {articles().map((article) => (
        <ArticleCard
          id={article.id}
          title={article.title}
          description={article.description}
          image={getAssetURL(article.front_img)}
        />
      ))}
    </div>
  );
};

export default ArticleList;