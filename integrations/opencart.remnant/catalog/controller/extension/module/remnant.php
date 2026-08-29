<?php

class ControllerExtensionModuleRemnant extends Controller
{
    public function index()
    {
        $this->ping();
    }

    public function ping()
    {
        if (!$this->authorize()) {
            return;
        }

        $this->json(['ok' => true]);
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

        $this->response->setOutput(json_encode($data, JSON_UNESCAPED_UNICODE));
    }
}
