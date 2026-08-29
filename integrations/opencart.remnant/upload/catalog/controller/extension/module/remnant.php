<?php

class ControllerExtensionModuleRemnant extends Controller
{
    /**
     * Bump together with REQUIRED_SITE_MODULE_PROTOCOL in the Remnant backend
     * when the shop module API changes.
     */
    public const PROTOCOL = 2;

    public function index()
    {
        $this->ping();
    }

    public function ping()
    {
        if (!$this->authorize()) {
            return;
        }

        $this->json([
            'ok' => true,
            'data' => ['version' => self::PROTOCOL],
        ]);
    }

    public function categories()
    {
        if (!$this->authorize()) {
            return;
        }

        $this->load->model('extension/module/remnant');
        $this->json([
            'ok' => true,
            'data' => $this->model_extension_module_remnant->getCategories(),
        ]);
    }

    public function products()
    {
        if (!$this->authorize()) {
            return;
        }

        $q = isset($this->request->get['q']) ? trim((string) $this->request->get['q']) : '';
        $ids = isset($this->request->get['ids']) ? (string) $this->request->get['ids'] : '';
        $limit = isset($this->request->get['limit']) ? (int) $this->request->get['limit'] : 50;

        $this->load->model('extension/module/remnant');
        $this->json([
            'ok' => true,
            'data' => $this->model_extension_module_remnant->searchProducts($q, $ids, $limit),
        ]);
    }

    public function attributes()
    {
        if (!$this->authorize()) {
            return;
        }

        $this->load->model('extension/module/remnant');
        $this->json([
            'ok' => true,
            'data' => $this->model_extension_module_remnant->getAttributes(),
        ]);
    }

    public function languages()
    {
        if (!$this->authorize()) {
            return;
        }

        $this->load->model('extension/module/remnant');
        $this->json([
            'ok' => true,
            'data' => $this->model_extension_module_remnant->getLanguages(),
        ]);
    }

    public function createProduct()
    {
        if (!$this->authorize()) {
            return;
        }

        $payload = $this->body();
        if ($payload === null) {
            return $this->json(['ok' => false, 'error' => 'invalid_json'], 400);
        }

        $this->load->model('extension/module/remnant');

        try {
            $productId = $this->model_extension_module_remnant->createProduct($payload);
            $this->json(['ok' => true, 'data' => ['productId' => $productId]]);
        } catch (Exception $e) {
            $this->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function editProduct()
    {
        if (!$this->authorize()) {
            return;
        }

        $payload = $this->body();
        if ($payload === null) {
            return $this->json(['ok' => false, 'error' => 'invalid_json'], 400);
        }

        $this->load->model('extension/module/remnant');

        $remnantId = isset($payload['remnantId']) ? (string) $payload['remnantId'] : '';
        $productId = $this->model_extension_module_remnant->findProductId($remnantId);

        try {
            if (!$productId) {
                $productId = $this->model_extension_module_remnant->createProduct($payload);
            } else {
                $this->model_extension_module_remnant->editProduct($productId, $payload);
            }

            $this->json(['ok' => true, 'data' => ['productId' => (int) $productId]]);
        } catch (Exception $e) {
            $this->json(['ok' => false, 'error' => $e->getMessage()], 400);
        }
    }

    public function editQuantity()
    {
        if (!$this->authorize()) {
            return;
        }

        $payload = $this->body();
        if ($payload === null) {
            return $this->json(['ok' => false, 'error' => 'invalid_json'], 400);
        }

        $this->load->model('extension/module/remnant');

        $remnantId = isset($payload['remnantId']) ? (string) $payload['remnantId'] : '';
        $quantity = isset($payload['quantity']) ? (int) $payload['quantity'] : 0;
        $productId = $this->model_extension_module_remnant->findProductId($remnantId);

        if (!$productId) {
            return $this->json(['ok' => false, 'error' => 'not_found'], 404);
        }

        $this->model_extension_module_remnant->editQuantity($productId, $quantity);
        $this->json(['ok' => true]);
    }

    public function linkProduct()
    {
        if (!$this->authorize()) {
            return;
        }

        $payload = $this->body();
        if ($payload === null) {
            return $this->json(['ok' => false, 'error' => 'invalid_json'], 400);
        }

        $remnantId = isset($payload['remnantId']) ? (string) $payload['remnantId'] : '';
        $productId = isset($payload['productId']) ? (int) $payload['productId'] : 0;

        if ($remnantId === '' || $productId <= 0) {
            return $this->json(['ok' => false, 'error' => 'remnantId and productId are required'], 400);
        }

        $this->load->model('extension/module/remnant');
        $this->model_extension_module_remnant->upsertLink($productId, $remnantId);
        $this->json(['ok' => true, 'data' => ['productId' => $productId]]);
    }

    public function unlinkProduct()
    {
        if (!$this->authorize()) {
            return;
        }

        $payload = $this->body();
        if ($payload === null) {
            return $this->json(['ok' => false, 'error' => 'invalid_json'], 400);
        }

        $remnantId = isset($payload['remnantId']) ? (string) $payload['remnantId'] : '';
        if ($remnantId === '') {
            return $this->json(['ok' => false, 'error' => 'remnantId is required'], 400);
        }

        $this->load->model('extension/module/remnant');
        $this->model_extension_module_remnant->unlinkProduct($remnantId);
        $this->json(['ok' => true]);
    }

    private function authorize()
    {
        $this->load->model('extension/module/remnant');
        $settings = $this->model_extension_module_remnant->getSettings();
        $key = isset($this->request->get['key']) ? (string) $this->request->get['key'] : '';

        $active = isset($settings['active']) && (int) $settings['active'] === 1;
        $stored = isset($settings['key']) ? (string) $settings['key'] : '';

        if ($active && $stored !== '' && hash_equals($stored, $key)) {
            return true;
        }

        $this->json(['ok' => false, 'error' => 'unauthorized'], 401);
        return false;
    }

    private function body()
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || $raw === '') {
            return [];
        }

        $data = json_decode($raw, true);
        return is_array($data) ? $data : null;
    }

    private function json($data, $status = 200)
    {
        $this->response->addHeader('Content-Type: application/json; charset=utf-8');

        if ($status !== 200) {
            $this->response->addHeader($this->request->server['SERVER_PROTOCOL'] . ' ' . $status);
        }

        if (is_array($data) && !isset($data['version'])) {
            $data['version'] = self::PROTOCOL;
        }

        $this->response->setOutput(json_encode($data, JSON_UNESCAPED_UNICODE));
    }
}
