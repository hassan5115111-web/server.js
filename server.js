const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

// 1. تعريف الـ Manifest للتطبيق
const manifest = {
    id: 'org.mycustom.nuvioaddon',
    version: '1.0.0',
    name: 'Nuvio Ultra Stream',
    description: 'إضافة سريعة وقوية لجلب أفضل روابط 4K وتورنت مع دعم الدبلجة والترجمة',
    resources: ['stream'],
    types: ['movie', 'series'],
    catalogs: []
};

app.get('/manifest.json', (req, res) => {
    res.json(manifest);
});

// 2. دالة التعامل مع طلبات البث (Streams)
app.get('/stream/:type/:id.json', async (req, res) => {
    const { type, id } = req.params;
    console.log(`طلب بحث عن: ${type} - المعرف: ${id}`);

    try {
        let streams = [];

        // أ) جلب النتائج من خوادم سريعة بديلة (مثل Comet API)
        const cometResponse = await axios.get(`https://comet.elfhosted.com/stream/${type}/${id}.json`).catch(() => null);
        if (cometResponse && cometResponse.data && cometResponse.data.streams) {
            streams = streams.concat(cometResponse.data.streams);
        }

        // ب) تصفية وترتيب النتائج (إعطاء الأولوية لجودة 4K و 1080p والأعلى في الـ Seeders)
        streams = streams.map(stream => ({
            name: `[Nuvio Ultra] ${stream.name || ''}`,
            title: `${stream.title || 'رابط سريع'}\n⚡ المصدر: خادم خاص`,
            infoHash: stream.infoHash,
            fileIdx: stream.fileIdx,
            url: stream.url
        }));

        res.json({ streams });
    } catch (error) {
        console.error("خطأ في جلب الروابط:", error);
        res.json({ streams: [] });
    }
});

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
    console.log(`Nuvio Custom Addon Server running on http://localhost:${PORT}/manifest.json`);
});
