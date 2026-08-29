<?php

class ModelExtensionModuleRemnant extends Model
{
    public function getSettings()
    {
        return [
            'active' => (int) $this->config->get('module_remnant_status'),
            'key' => (string) $this->config->get('module_remnant_key'),
        ];
    }

    public function getLanguageMap()
    {
        $map = [];
        $query = $this->db->query("SELECT language_id, code FROM `" . DB_PREFIX . "language`");

        foreach ($query->rows as $row) {
            $code = strtolower(trim($row['code']));
            $short = explode('-', $code)[0];
            $id = (int) $row['language_id'];
            $map[$code] = $id;
            $map[$short] = $id;
        }

        return $map;
    }

    public function matchLanguageId($code, $languageMap)
    {
        $raw = trim((string) $code);
        if ($raw !== '' && ctype_digit($raw)) {
            $id = (int) $raw;
            foreach ($languageMap as $mappedId) {
                if ((int) $mappedId === $id) {
                    return $id;
                }
            }
            return null;
        }

        $code = strtolower($raw);
        if (isset($languageMap[$code])) {
            return $languageMap[$code];
        }

        $short = explode('-', $code)[0];
        return isset($languageMap[$short]) ? $languageMap[$short] : null;
    }

    public function getCategories()
    {
        $languageMap = $this->getLanguageMap();
        $idToCode = [];
        foreach ($languageMap as $code => $id) {
            if (strpos($code, '-') === false) {
                $idToCode[$id] = $code;
            }
        }

        $query = $this->db->query("
            SELECT c.category_id, c.parent_id, cd.language_id, cd.name
            FROM `" . DB_PREFIX . "category` c
            LEFT JOIN `" . DB_PREFIX . "category_description` cd ON (c.category_id = cd.category_id)
            WHERE c.status = '1'
            ORDER BY c.sort_order, c.category_id
        ");

        $grouped = [];
        foreach ($query->rows as $row) {
            $id = (int) $row['category_id'];
            if (!isset($grouped[$id])) {
                $grouped[$id] = [
                    'id' => $id,
                    'parentId' => (int) $row['parent_id'],
                    'names' => [],
                ];
            }

            $code = isset($idToCode[(int) $row['language_id']]) ? $idToCode[(int) $row['language_id']] : (string) $row['language_id'];
            $grouped[$id]['names'][$code] = $row['name'];
        }

        return $this->withObjectNames(array_values($grouped));
    }

    private function withObjectNames(array $items)
    {
        foreach ($items as &$item) {
            $item['names'] = (object) (isset($item['names']) ? $item['names'] : []);
        }
        unset($item);

        return $items;
    }

    private function getNamedRows($sql)
    {
        $languageMap = $this->getLanguageMap();
        $idToCode = [];
        foreach ($languageMap as $code => $id) {
            if (strpos($code, '-') === false) {
                $idToCode[$id] = $code;
            }
        }

        $query = $this->db->query($sql);
        $grouped = [];

        foreach ($query->rows as $row) {
            $id = (int) $row['id'];
            if (!isset($grouped[$id])) {
                $grouped[$id] = [
                    'id' => $id,
                    'names' => [],
                ];
            }

            if (!isset($row['name']) || $row['name'] === null) {
                continue;
            }

            $code = isset($idToCode[(int) $row['language_id']]) ? $idToCode[(int) $row['language_id']] : (string) $row['language_id'];
            $grouped[$id]['names'][$code] = $row['name'];
        }

        return $this->withObjectNames(array_values($grouped));
    }

    public function searchProducts($q, $ids, $limit)
    {
        $limit = (int) $limit;
        if ($limit <= 0 || $limit > 100) {
            $limit = 50;
        }

        $idList = [];
        if ($ids !== '') {
            foreach (explode(',', $ids) as $id) {
                $id = (int) trim($id);
                if ($id > 0) {
                    $idList[] = $id;
                }
            }
            $idList = array_values(array_unique($idList));
        }

        if ($idList) {
            $idSql = implode(',', $idList);
            return $this->getNamedRows(
                "SELECT p.product_id AS id, pd.language_id, pd.name
                 FROM `" . DB_PREFIX . "product` p
                 LEFT JOIN `" . DB_PREFIX . "product_description` pd ON (p.product_id = pd.product_id)
                 WHERE p.product_id IN (" . $idSql . ")
                 ORDER BY p.product_id"
            );
        }

        $where = '';
        if ($q !== '') {
            $escaped = $this->db->escape($q);
            if (ctype_digit($q)) {
                $where = "WHERE (p.product_id = " . (int) $q . " OR pd.name LIKE '%" . $escaped . "%')";
            } else {
                $where = "WHERE pd.name LIKE '%" . $escaped . "%'";
            }
        }

        $idQuery = $this->db->query("
            SELECT DISTINCT p.product_id AS id
            FROM `" . DB_PREFIX . "product` p
            LEFT JOIN `" . DB_PREFIX . "product_description` pd ON (p.product_id = pd.product_id)
            " . $where . "
            ORDER BY p.product_id
            LIMIT " . $limit . "
        ");

        $productIds = [];
        foreach ($idQuery->rows as $row) {
            $productIds[] = (int) $row['id'];
        }

        if (!$productIds) {
            return [];
        }

        return $this->getNamedRows(
            "SELECT p.product_id AS id, pd.language_id, pd.name
             FROM `" . DB_PREFIX . "product` p
             LEFT JOIN `" . DB_PREFIX . "product_description` pd ON (p.product_id = pd.product_id)
             WHERE p.product_id IN (" . implode(',', $productIds) . ")
             ORDER BY p.product_id"
        );
    }

    public function getProducts()
    {
        return $this->searchProducts('', '', 50);
    }

    public function getAttributes()
    {
        return $this->getNamedRows(
            "SELECT a.attribute_id AS id, ad.language_id, ad.name
             FROM `" . DB_PREFIX . "attribute` a
             LEFT JOIN `" . DB_PREFIX . "attribute_description` ad ON (a.attribute_id = ad.attribute_id)
             ORDER BY a.sort_order, a.attribute_id"
        );
    }

    public function getLanguages()
    {
        $query = $this->db->query("
            SELECT language_id, name, code
            FROM `" . DB_PREFIX . "language`
            WHERE status = '1'
            ORDER BY sort_order, language_id
        ");

        $items = [];
        foreach ($query->rows as $row) {
            $label = $row['name'] . ' (' . $row['code'] . ')';
            $items[] = [
                'id' => (int) $row['language_id'],
                'names' => [
                    'ru' => $label,
                    'en' => $label,
                ],
            ];
        }

        return $this->withObjectNames($items);
    }

    public function findProductId($remnantId)
    {
        if ($remnantId === '') {
            return null;
        }

        $query = $this->db->query("
            SELECT product_id FROM `" . DB_PREFIX . "remnant_product`
            WHERE remnant_id = '" . $this->db->escape($remnantId) . "'
            LIMIT 1
        ");

        return $query->num_rows ? (int) $query->row['product_id'] : null;
    }

    public function upsertLink($productId, $remnantId)
    {
        $this->db->query("
            INSERT INTO `" . DB_PREFIX . "remnant_product` (`product_id`, `remnant_id`)
            VALUES ('" . (int) $productId . "', '" . $this->db->escape($remnantId) . "')
            ON DUPLICATE KEY UPDATE
                `product_id` = VALUES(`product_id`),
                `remnant_id` = VALUES(`remnant_id`)
        ");
    }

    public function unlinkProduct($remnantId)
    {
        if ($remnantId === '') {
            return;
        }

        $this->db->query("
            DELETE FROM `" . DB_PREFIX . "remnant_product`
            WHERE remnant_id = '" . $this->db->escape($remnantId) . "'
        ");
    }

    public function createProduct($data)
    {
        $remnantId = isset($data['remnantId']) ? (string) $data['remnantId'] : '';
        if ($remnantId === '') {
            throw new Exception('remnantId is required');
        }

        $existing = $this->findProductId($remnantId);
        if ($existing) {
            $this->editProduct($existing, $data);
            return $existing;
        }

        $price = isset($data['price']) ? (float) $data['price'] : 0;
        $quantity = isset($data['quantity']) ? (int) $data['quantity'] : 0;
        $model = $this->db->escape($this->pickModel($data, $remnantId));

        $this->db->query("
            INSERT INTO `" . DB_PREFIX . "product`
            SET model = '" . $model . "',
                sku = '',
                upc = '',
                ean = '',
                jan = '',
                isbn = '',
                mpn = '',
                location = '',
                quantity = '" . $quantity . "',
                minimum = '1',
                subtract = '1',
                stock_status_id = '7',
                date_available = '" . $this->db->escape(date('Y-m-d')) . "',
                manufacturer_id = '0',
                shipping = '1',
                price = '" . $price . "',
                points = '0',
                weight = '0',
                weight_class_id = '1',
                length = '0',
                width = '0',
                height = '0',
                length_class_id = '1',
                status = '1',
                tax_class_id = '0',
                sort_order = '1',
                date_added = NOW(),
                date_modified = NOW()
        ");

        $productId = $this->db->getLastId();

        $this->writeDescriptions($productId, isset($data['names']) ? $data['names'] : []);
        $this->writeSeo($productId, isset($data['seo']) ? $data['seo'] : [], isset($data['names']) ? $data['names'] : []);
        $this->replaceCategories($productId, isset($data['categoryIds']) ? $data['categoryIds'] : []);
        $this->replaceAttributes($productId, isset($data['attributes']) ? $data['attributes'] : []);
        $this->replaceImages($productId, isset($data['images']) ? $data['images'] : []);
        $this->ensureStore($productId);
        $this->upsertLink($productId, $remnantId);

        $this->cache->delete('product');

        return (int) $productId;
    }

    public function editProduct($productId, $data)
    {
        $productId = (int) $productId;
        $sets = ["date_modified = NOW()"];

        if (isset($data['price'])) {
            $sets[] = "price = '" . (float) $data['price'] . "'";
        }

        if (isset($data['names']) && is_array($data['names'])) {
            $model = $this->db->escape($this->pickModel($data, isset($data['remnantId']) ? $data['remnantId'] : ''));
            $sets[] = "model = '" . $model . "'";
        }

        $this->db->query("
            UPDATE `" . DB_PREFIX . "product`
            SET " . implode(', ', $sets) . "
            WHERE product_id = '" . $productId . "'
        ");

        if (isset($data['names']) && is_array($data['names'])) {
            $this->writeDescriptions($productId, $data['names']);
        }

        if (isset($data['seo']) || isset($data['names'])) {
            $this->writeSeo(
                $productId,
                isset($data['seo']) ? $data['seo'] : [],
                isset($data['names']) ? $data['names'] : []
            );
        }

        if (isset($data['categoryIds']) && is_array($data['categoryIds'])) {
            $this->replaceCategories($productId, $data['categoryIds']);
        }

        if (isset($data['attributes']) && is_array($data['attributes'])) {
            $this->replaceAttributes($productId, $data['attributes']);
        }

        if (isset($data['images']) && is_array($data['images'])) {
            $this->replaceImages($productId, $data['images']);
        }

        if (isset($data['remnantId']) && $data['remnantId'] !== '') {
            $this->upsertLink($productId, (string) $data['remnantId']);
        }

        $this->cache->delete('product');
    }

    public function editQuantity($productId, $quantity)
    {
        $this->db->query("
            UPDATE `" . DB_PREFIX . "product`
            SET quantity = '" . (int) $quantity . "',
                date_modified = NOW()
            WHERE product_id = '" . (int) $productId . "'
        ");

        $this->cache->delete('product');
    }

    private function pickModel($data, $remnantId)
    {
        $names = isset($data['names']) && is_array($data['names']) ? $data['names'] : [];
        if (isset($names['ru']) && $names['ru'] !== '') {
            return $names['ru'];
        }
        if (isset($names['en']) && $names['en'] !== '') {
            return $names['en'];
        }
        foreach ($names as $name) {
            if ($name !== '') {
                return $name;
            }
        }
        return $remnantId !== '' ? $remnantId : 'product';
    }

    private function writeDescriptions($productId, $names)
    {
        if (!is_array($names) || !$names) {
            return;
        }

        $languageMap = $this->getLanguageMap();
        $written = 0;

        foreach ($names as $code => $name) {
            $languageId = $this->matchLanguageId($code, $languageMap);
            if (!$languageId || $name === '' || $name === null) {
                continue;
            }

            $safeName = $this->db->escape($name);
            $existing = $this->db->query("
                SELECT product_id FROM `" . DB_PREFIX . "product_description`
                WHERE product_id = '" . (int) $productId . "'
                  AND language_id = '" . (int) $languageId . "'
                LIMIT 1
            ");

            if ($existing->num_rows) {
                $this->db->query("
                    UPDATE `" . DB_PREFIX . "product_description`
                    SET name = '" . $safeName . "',
                        meta_title = '" . $safeName . "'
                    WHERE product_id = '" . (int) $productId . "'
                      AND language_id = '" . (int) $languageId . "'
                ");
            } else {
                $this->db->query("
                    INSERT INTO `" . DB_PREFIX . "product_description`
                    SET product_id = '" . (int) $productId . "',
                        language_id = '" . (int) $languageId . "',
                        name = '" . $safeName . "',
                        description = '',
                        tag = '',
                        meta_title = '" . $safeName . "',
                        meta_description = '',
                        meta_keyword = ''
                ");
            }

            $written++;
        }

        if ($written === 0 && $languageMap) {
            $firstId = reset($languageMap);
            $fallback = $this->pickModel(['names' => $names], '');
            $this->db->query("
                INSERT INTO `" . DB_PREFIX . "product_description`
                SET product_id = '" . (int) $productId . "',
                    language_id = '" . (int) $firstId . "',
                    name = '" . $this->db->escape($fallback) . "',
                    description = '',
                    tag = '',
                    meta_title = '" . $this->db->escape($fallback) . "',
                    meta_description = '',
                    meta_keyword = ''
            ");
        }
    }

    private function writeSeo($productId, $seo, $names)
    {
        $languageMap = $this->getLanguageMap();
        $this->db->query("DELETE FROM `" . DB_PREFIX . "seo_url` WHERE query = 'product_id=" . (int) $productId . "'");

        $slugs = is_array($seo) ? $seo : [];
        if (!$slugs && is_array($names)) {
            foreach ($names as $code => $name) {
                $slugs[$code] = $this->slugify($name);
            }
        }

        foreach ($slugs as $code => $keyword) {
            $languageId = $this->matchLanguageId($code, $languageMap);
            $keyword = $this->slugify($keyword);
            if (!$languageId || $keyword === '') {
                continue;
            }

            $unique = $this->uniqueKeyword($keyword, $productId);
            $this->db->query("
                INSERT INTO `" . DB_PREFIX . "seo_url`
                SET store_id = '0',
                    language_id = '" . (int) $languageId . "',
                    query = 'product_id=" . (int) $productId . "',
                    keyword = '" . $this->db->escape($unique) . "'
            ");
        }
    }

    private function replaceCategories($productId, $categoryIds)
    {
        $this->db->query("DELETE FROM `" . DB_PREFIX . "product_to_category` WHERE product_id = '" . (int) $productId . "'");

        if (!is_array($categoryIds)) {
            return;
        }

        $seen = [];
        foreach ($categoryIds as $categoryId) {
            $id = (int) $categoryId;
            if ($id <= 0 || isset($seen[$id])) {
                continue;
            }
            $seen[$id] = true;
            $this->db->query("
                INSERT INTO `" . DB_PREFIX . "product_to_category`
                SET product_id = '" . (int) $productId . "',
                    category_id = '" . $id . "'
            ");
        }
    }

    private function replaceAttributes($productId, $attributes)
    {
        $this->db->query("DELETE FROM `" . DB_PREFIX . "product_attribute` WHERE product_id = '" . (int) $productId . "'");

        if (!is_array($attributes) || !$attributes) {
            return;
        }

        $languageMap = $this->getLanguageMap();
        $allLanguageIds = [];
        foreach ($languageMap as $code => $id) {
            if (strpos($code, '-') === false) {
                $allLanguageIds[(int) $id] = true;
            }
        }
        if (!$allLanguageIds && $languageMap) {
            $allLanguageIds[(int) reset($languageMap)] = true;
        }

        $seen = [];
        foreach ($attributes as $attribute) {
            if (!is_array($attribute)) {
                continue;
            }

            $attributeId = isset($attribute['attributeId']) ? (int) $attribute['attributeId'] : 0;
            if ($attributeId <= 0 || isset($seen[$attributeId])) {
                continue;
            }
            $seen[$attributeId] = true;

            $texts = $this->attributeTexts($attribute, $languageMap, $allLanguageIds);
            foreach ($texts as $languageId => $text) {
                if ($text === '') {
                    continue;
                }

                $this->db->query("
                    INSERT INTO `" . DB_PREFIX . "product_attribute`
                    SET product_id = '" . (int) $productId . "',
                        attribute_id = '" . $attributeId . "',
                        language_id = '" . (int) $languageId . "',
                        text = '" . $this->db->escape($text) . "'
                ");
            }
        }
    }

    private function attributeTexts($attribute, $languageMap, $allLanguageIds)
    {
        $raw = isset($attribute['text']) ? $attribute['text'] : '';
        $texts = [];

        if (is_array($raw)) {
            foreach ($raw as $code => $text) {
                $languageId = $this->matchLanguageId($code, $languageMap);
                if (!$languageId || $text === null || $text === '') {
                    continue;
                }
                $texts[(int) $languageId] = (string) $text;
            }
            return $texts;
        }

        $text = trim((string) $raw);
        if ($text === '') {
            return [];
        }

        foreach (array_keys($allLanguageIds) as $languageId) {
            $texts[(int) $languageId] = $text;
        }
        return $texts;
    }

    private function replaceImages($productId, $images)
    {
        $this->db->query("DELETE FROM `" . DB_PREFIX . "product_image` WHERE product_id = '" . (int) $productId . "'");

        $saved = [];
        if (is_array($images)) {
            foreach ($images as $image) {
                $url = is_array($image) && isset($image['url']) ? $image['url'] : '';
                $name = is_array($image) && isset($image['name']) ? $image['name'] : '';
                $path = $this->downloadImage($url, $name);
                if ($path) {
                    $saved[] = $path;
                }
            }
        }

        $main = isset($saved[0]) ? $saved[0] : '';
        $this->db->query("
            UPDATE `" . DB_PREFIX . "product`
            SET image = '" . $this->db->escape($main) . "'
            WHERE product_id = '" . (int) $productId . "'
        ");

        foreach (array_slice($saved, 1) as $index => $path) {
            $this->db->query("
                INSERT INTO `" . DB_PREFIX . "product_image`
                SET product_id = '" . (int) $productId . "',
                    image = '" . $this->db->escape($path) . "',
                    sort_order = '" . ((int) $index + 1) . "'
            ");
        }
    }

    private function ensureStore($productId)
    {
        $existing = $this->db->query("
            SELECT product_id FROM `" . DB_PREFIX . "product_to_store`
            WHERE product_id = '" . (int) $productId . "' AND store_id = '0'
            LIMIT 1
        ");

        if (!$existing->num_rows) {
            $this->db->query("
                INSERT INTO `" . DB_PREFIX . "product_to_store`
                SET product_id = '" . (int) $productId . "',
                    store_id = '0'
            ");
        }
    }

    private function downloadImage($url, $basename)
    {
        if ($url === '' || !filter_var($url, FILTER_VALIDATE_URL)) {
            return null;
        }

        $dir = DIR_IMAGE . 'catalog/remnant/';
        if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
            return null;
        }

        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '_', (string) $basename);
        if ($filename === '' || $filename === '_') {
            $pathInfo = pathinfo(parse_url($url, PHP_URL_PATH));
            $filename = isset($pathInfo['basename']) ? preg_replace('/[^a-zA-Z0-9._-]/', '_', $pathInfo['basename']) : '';
        }
        if ($filename === '' || $filename === '_') {
            $filename = uniqid('img_') . '.jpg';
        }

        $destination = $dir . $filename;
        $fp = fopen($destination, 'w');
        if (!$fp) {
            return null;
        }

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        $ok = curl_exec($ch);
        $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);

        if (!$ok || $httpCode >= 400 || !filesize($destination)) {
            @unlink($destination);
            return null;
        }

        return 'catalog/remnant/' . $filename;
    }

    private function slugify($value)
    {
        $value = trim(mb_strtolower((string) $value, 'UTF-8'));
        $value = preg_replace('/[^\p{L}\p{N}]+/u', '-', $value);
        return trim($value, '-');
    }

    private function uniqueKeyword($keyword, $productId)
    {
        $base = $keyword;
        $suffix = 0;

        while (true) {
            $candidate = $suffix === 0 ? $base : $base . '-' . $suffix;
            $query = $this->db->query("
                SELECT keyword FROM `" . DB_PREFIX . "seo_url`
                WHERE keyword = '" . $this->db->escape($candidate) . "'
                  AND query != 'product_id=" . (int) $productId . "'
                LIMIT 1
            ");

            if (!$query->num_rows) {
                return $candidate;
            }

            $suffix++;
        }
    }
}
