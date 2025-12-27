import copy from '@/content/copy.json';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-light mb-8">{copy.pages.contact.title}</h1>
      <div className="prose prose-lg max-w-none">
        <p>{copy.pages.contact.content}</p>
      </div>
    </div>
  );
}

