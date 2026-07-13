export default async (request, context) => {
  const url = new URL(request.url);
  const postId = url.searchParams.get("id");

  // post.html?id=X ለሚለው ጥያቄ ብቻ ይሰራል
  if (url.pathname !== "/post.html" || !postId) {
    return;
  }

  try {
    // 1. የ news.json ፋይልን ያነባል
    const newsResponse = await fetch(new URL("/news.json", request.url).href);
    if (!newsResponse.ok) return;
    const data = await newsResponse.json();

    // 2. የተመረጠውን ዜና ያገኛል
    const post = data.posts[parseInt(postId)];
    if (!post) return;

    // 3. የ post.html ፋይልን ያነባል
    const response = await context.next();
    let html = await response.text();

    // 4. ለቦቶቹ የሚላከውን መረጃ ያዘጋጃል
    const title = post.title || "ግሎባል ቪው ኢቲ | Global View ET";
    const description = post.description || "ታማኝ፣ ፈጣን እና ሚዛናዊ ዜና ለኢትዮጵያውያን።";
    const imageUrl = post.image 
      ? new URL(post.image, request.url).href 
      : new URL("/photo_2026-03-31_08-48-12.jpg", request.url).href;

    // 5. በ post.html ውስጥ ያሉትን መረጃዎች በራሱ ዜና ይተካቸዋል
    html = html.replace(
      /<title>.*?<\/title>/i,
      `<title>${title} | Global View ET</title>
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description} - ዘጋቢ፦ ${post.author || 'ግሎባል ቪው'}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:url" content="${request.url}">
      <meta property="og:type" content="article">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${imageUrl}">`
    );

    return new Response(html, {
      headers: { "content-type": "text/html; charset=UTF-8" },
    });
  } catch (error) {
    console.error("Edge function error:", error);
  }
};
