"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { JapCollection, JapCollectionItem } from "@/lib/repo/jap-collections";

type CollectionWithItems = JapCollection & { items: JapCollectionItem[] };

const EMPTY_ITEM: JapCollectionItem = {
  _id: "", collectionId: "", sequenceNumber: 0, slug: "", titleHi: "",
  sourceConfidence: "community", contentStatus: "researched", youtubeLink: null,
};

export default function AdminJaapDirectoryPage() {
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ item: JapCollectionItem; isNew: boolean } | null>(null);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/jap-collections");
    const data = await res.json();
    setCollections(data.collections || []);
    if (!activeCollectionId && data.collections?.length) {
      setActiveCollectionId(data.collections[0]._id);
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    load();
  }, []);

  const activeCollection = collections.find((c) => c._id === activeCollectionId);

  async function saveItem(item: JapCollectionItem, isNew: boolean) {
    if (isNew) {
      await fetch("/api/admin/jap-collection-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, collectionId: activeCollectionId }),
      });
    } else {
      await fetch(`/api/admin/jap-collection-items/${item._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    setEditingItem(null);
    load();
  }

  async function removeItem(item: JapCollectionItem) {
    if (!confirm(`"${item.titleHi}" को हटाएं? यह पूर्ववत नहीं किया जा सकता।`)) return;
    await fetch(`/api/admin/jap-collection-items/${item._id}`, { method: "DELETE" });
    load();
  }

  async function removeCollection(c: CollectionWithItems) {
    if (!confirm(`"${c.nameHi}" संग्रह व इसकी सभी ${c.items.length} प्रविष्टियाँ हटाएं? यह पूर्ववत नहीं किया जा सकता।`)) return;
    await fetch(`/api/admin/jap-collections/${c._id}`, { method: "DELETE" });
    setActiveCollectionId(null);
    load();
  }

  if (loading) return <p className="font-hindi text-charcoal/50">लोड हो रहा है...</p>;

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <h1 className="font-display-hi text-3xl text-charcoal">जैन जाप निर्देशिका प्रबंधन</h1>
        <button
          onClick={() => setCreatingCollection(true)}
          className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-gold-deep to-gold px-4 py-2 font-hindi text-sm text-warm-white"
        >
          <Plus size={15} /> नया संग्रह
        </button>
      </div>
      <p className="font-hindi text-sm text-charcoal/55 mb-6">
        भक्तामर स्तोत्र, 64 ऋद्धि व अन्य संग्रहों की प्रविष्टियाँ देखें, जोड़ें, संपादित व हटाएं — विशेषकर &quot;शोध बाकी&quot; वाली प्रविष्टियाँ।
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {collections.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveCollectionId(c._id)}
            className={`rounded-full px-4 py-2 font-hindi text-sm border ${
              activeCollectionId === c._id ? "bg-gold-deep text-warm-white border-gold-deep" : "border-charcoal/20 text-charcoal/70"
            }`}
          >
            {c.nameHi} ({c.items.filter((i) => i.contentStatus === "researched").length}/{c.totalItems})
          </button>
        ))}
        {collections.length === 0 && (
          <p className="font-hindi text-sm text-charcoal/45">कोई संग्रह नहीं — &quot;नया संग्रह&quot; से शुरू करें।</p>
        )}
      </div>

      {activeCollection && (
        <>
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setEditingItem({ item: { ...EMPTY_ITEM, collectionId: activeCollection._id }, isNew: true })}
              className="flex items-center gap-1.5 font-hindi text-sm text-gold-deep underline"
            >
              <Plus size={14} /> नई प्रविष्टि जोड़ें
            </button>
            <button
              onClick={() => removeCollection(activeCollection)}
              className="flex items-center gap-1.5 font-hindi text-xs text-red-500"
            >
              <Trash2 size={13} /> यह पूरा संग्रह हटाएं
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-charcoal/10">
            <table className="w-full text-left">
              <thead className="bg-charcoal/5">
                <tr>
                  <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">क्रम</th>
                  <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">शीर्षक</th>
                  <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55">स्थिति</th>
                  <th className="px-4 py-3 font-hindi text-xs font-semibold text-charcoal/55"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal/5">
                {activeCollection.items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-2.5 font-sans text-sm text-charcoal/60">{item.sequenceNumber}</td>
                    <td className="px-4 py-2.5 font-hindi text-sm text-charcoal">{item.titleHi}</td>
                    <td className="px-4 py-2.5">
                      <span className={`font-hindi text-xs px-2 py-0.5 rounded-full ${
                        item.contentStatus === "researched" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {item.contentStatus === "researched" ? "पूर्ण" : "शोध बाकी"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setEditingItem({ item, isNew: false })} className="font-hindi text-xs text-gold-deep underline">
                          संपादित करें
                        </button>
                        <button onClick={() => removeItem(item)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {activeCollection.items.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-6 font-hindi text-sm text-charcoal/45 text-center">कोई प्रविष्टि नहीं — &quot;नई प्रविष्टि जोड़ें&quot; से शुरू करें।</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editingItem && (
        <Modal onClose={() => setEditingItem(null)}>
          <ItemEditForm
            item={editingItem.item}
            isNew={editingItem.isNew}
            onSave={(item) => saveItem(item, editingItem.isNew)}
            onCancel={() => setEditingItem(null)}
          />
        </Modal>
      )}

      {creatingCollection && (
        <Modal onClose={() => setCreatingCollection(false)}>
          <CollectionCreateForm
            onSave={async (data) => {
              const res = await fetch("/api/admin/jap-collections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              const result = await res.json();
              if (!result.success) {
                alert(result.error || "त्रुटि हुई");
                return;
              }
              setCreatingCollection(false);
              await load();
              setActiveCollectionId(result.collection._id);
            }}
            onCancel={() => setCreatingCollection(false)}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-warm-white rounded-2xl p-7 max-w-xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CollectionCreateForm({
  onSave,
  onCancel,
}: {
  onSave: (data: { slug: string; nameHi: string; nameEn: string; descriptionHi: string; totalItems: number; sourceNoteHi?: string; displayOrder: number }) => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [nameHi, setNameHi] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descriptionHi, setDescriptionHi] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [sourceNoteHi, setSourceNoteHi] = useState("");

  return (
    <div className="space-y-4">
      <h3 className="font-display-hi text-xl text-charcoal">नया संग्रह बनाएं</h3>
      <Field label="Slug (केवल अंग्रेज़ी अक्षर/अंक/हाइफ़न, जैसे: uttaradhyayan-sutra)">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className="kkb-input" />
      </Field>
      <Field label="नाम (हिंदी)">
        <input value={nameHi} onChange={(e) => setNameHi(e.target.value)} className="kkb-input" />
      </Field>
      <Field label="Name (English)">
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="kkb-input" />
      </Field>
      <Field label="विवरण">
        <textarea value={descriptionHi} onChange={(e) => setDescriptionHi(e.target.value)} rows={3} className="kkb-input" />
      </Field>
      <Field label="कुल प्रविष्टियाँ (अनुमानित, बाद में बदला जा सकता है)">
        <input type="number" value={totalItems} onChange={(e) => setTotalItems(Number(e.target.value))} className="kkb-input" />
      </Field>
      <Field label="स्रोत टिप्पणी (वैकल्पिक)">
        <textarea value={sourceNoteHi} onChange={(e) => setSourceNoteHi(e.target.value)} rows={2} className="kkb-input" />
      </Field>
      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave({ slug, nameHi, nameEn, descriptionHi, totalItems, sourceNoteHi: sourceNoteHi || undefined, displayOrder: 99 })}
          disabled={!slug || !nameHi || !nameEn || !descriptionHi}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-50"
        >
          बनाएं
        </button>
        <button onClick={onCancel} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
      </div>
    </div>
  );
}

function ItemEditForm({
  item,
  isNew,
  onSave,
  onCancel,
}: {
  item: JapCollectionItem;
  isNew: boolean;
  onSave: (item: JapCollectionItem) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<JapCollectionItem>(item);

  function update<K extends keyof JapCollectionItem>(key: K, value: JapCollectionItem[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display-hi text-xl text-charcoal">
        {isNew ? "नई प्रविष्टि जोड़ें" : `क्रमांक ${item.sequenceNumber} संपादित करें`}
      </h3>

      {isNew && (
        <Field label="Slug (केवल अंग्रेज़ी अक्षर/अंक/हाइफ़न, जैसे: uttaradhyayan-1)">
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="kkb-input" />
        </Field>
      )}
      <Field label="शीर्षक">
        <input value={form.titleHi} onChange={(e) => update("titleHi", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="संस्कृत/प्राकृत पाठ (वैकल्पिक)">
        <textarea value={form.sanskritText || ""} onChange={(e) => update("sanskritText", e.target.value)} rows={3} className="kkb-input" />
      </Field>
      <Field label="मंत्र — आवाहन">
        <input value={form.mantraAvahan || ""} onChange={(e) => update("mantraAvahan", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="मंत्र — प्रणाम">
        <input value={form.mantraPranam || ""} onChange={(e) => update("mantraPranam", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="मंत्र — सिद्धि">
        <input value={form.mantraSiddhi || ""} onChange={(e) => update("mantraSiddhi", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="जाप संख्या टिप्पणी">
        <input value={form.jaapCountNote || ""} onChange={(e) => update("jaapCountNote", e.target.value)} className="kkb-input" placeholder="जैसे: 108 बार, 21 दिन" />
      </Field>
      <Field label="उद्देश्य (Purpose)">
        <textarea value={form.purposeHi || ""} onChange={(e) => update("purposeHi", e.target.value)} rows={2} className="kkb-input" />
      </Field>
      <Field label="क्यों करें (Why)">
        <textarea value={form.whyToDoHi || ""} onChange={(e) => update("whyToDoHi", e.target.value)} rows={2} className="kkb-input" />
      </Field>
      <Field label="कब करें (When)">
        <input value={form.whenToDoHi || ""} onChange={(e) => update("whenToDoHi", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="अवधि (Duration)">
        <input value={form.durationNoteHi || ""} onChange={(e) => update("durationNoteHi", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="YouTube वीडियो लिंक (वैकल्पिक — यदि इस जाप का वीडियो बना हो)">
        <input
          value={form.youtubeLink || ""}
          onChange={(e) => update("youtubeLink", e.target.value || null)}
          className="kkb-input"
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </Field>
      <Field label="स्रोत संदर्भ (Granth Reference)">
        <input value={form.granthReference || ""} onChange={(e) => update("granthReference", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="स्रोत विश्वसनीयता">
        <select value={form.sourceConfidence} onChange={(e) => update("sourceConfidence", e.target.value as JapCollectionItem["sourceConfidence"])} className="kkb-input">
          <option value="community">community (कोई विशिष्ट उद्धरण नहीं)</option>
          <option value="traditional">traditional (परंपरागत स्रोत)</option>
          <option value="verified">verified (सत्यापित प्रामाणिक स्रोत)</option>
        </select>
      </Field>
      <Field label="सामग्री स्थिति">
        <select value={form.contentStatus} onChange={(e) => update("contentStatus", e.target.value as JapCollectionItem["contentStatus"])} className="kkb-input">
          <option value="pending">pending (शोध बाकी)</option>
          <option value="researched">researched (पूर्ण)</option>
        </select>
      </Field>
      <Field label="SEO Title">
        <input value={form.seoTitle || ""} onChange={(e) => update("seoTitle", e.target.value)} className="kkb-input" />
      </Field>
      <Field label="Meta Description">
        <textarea value={form.metaDescription || ""} onChange={(e) => update("metaDescription", e.target.value)} rows={2} className="kkb-input" />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => onSave(form)}
          disabled={isNew && (!form.slug || !form.titleHi)}
          className="rounded-full bg-gradient-to-r from-gold-deep to-gold px-6 py-2.5 font-hindi text-sm text-warm-white disabled:opacity-50"
        >
          सहेजें
        </button>
        <button onClick={onCancel} className="font-hindi text-sm text-charcoal/50">रद्द करें</button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-hindi text-xs text-charcoal/60 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
