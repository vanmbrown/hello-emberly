import copy from '@/content/copy.json';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-light mb-8">{copy.pages.privacy.title}</h1>
      <div className="prose prose-lg max-w-none">
        <p>{copy.pages.privacy.content}</p>
        <div className="mt-8 p-4 bg-foreground/5 rounded-lg border border-foreground/10">
          <p className="text-sm text-foreground/70 italic">
            {copy.pages.privacy.medicalDisclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

