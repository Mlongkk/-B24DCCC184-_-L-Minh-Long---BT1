import React, {useEffect, useState} from "react";
import axios from "axios";

interface Article {
  id: number;
  title: string;
  summary: string;
  url: string;
  image_url: string;
  published_at: string;
  news_site: string;
}

export default function News() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get(
          "https://api.spaceflightnewsapi.net/v4/articles?limit=10"
        );
        setArticles(res.data.results);
      } catch (err) {
        console.error(err);
        setError("Không tải được tin tức. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) return <p>Đang tải tin tức...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Tin tức</h2>
      {articles.map((a) => (
        <div
          key={a.id}
          style={{
            marginBottom: "20px",
            paddingBottom: "10px",
            borderBottom: "1px solid #ccc",
          }}
        >
          {a.image_url && (
            <img
              src={a.image_url}
              alt={a.title}
              width="250"
              style={{borderRadius: "6px"}}
            />
          )}
          <h3>{a.title}</h3>
          <p>{a.summary}</p>
          <a href={a.url} target="_blank" rel="noreferrer">
            Đọc thêm tại {a.news_site}
          </a>
          <p>
            <small>
              Ngày đăng: {new Date(a.published_at).toLocaleDateString()}
            </small>
          </p>
        </div>
      ))}
    </div>
  );
}
