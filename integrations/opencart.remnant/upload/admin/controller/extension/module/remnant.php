<?php

class ControllerExtensionModuleRemnant extends Controller
{
    private $error = [];

    public function install()
    {
        $this->load->model('setting/setting');
        $this->model_setting_setting->editSetting('module_remnant', [
            'module_remnant_status' => 0,
            'module_remnant_key' => '',
        ]);

        $this->load->model('extension/module/remnant');
        $this->model_extension_module_remnant->install();

        $this->load->model('user/user_group');
        $this->model_user_user_group->addPermission($this->user->getGroupId(), 'access', 'extension/module/remnant');
        $this->model_user_user_group->addPermission($this->user->getGroupId(), 'modify', 'extension/module/remnant');
    }

    public function uninstall()
    {
        $this->load->model('setting/setting');
        $this->model_setting_setting->deleteSetting('module_remnant');

        $this->load->model('extension/module/remnant');
        $this->model_extension_module_remnant->uninstall();
    }

    public function index()
    {
        $this->load->language('extension/module/remnant');
        $this->load->model('setting/setting');

        $this->document->setTitle($this->language->get('heading_title'));

        if (($this->request->server['REQUEST_METHOD'] == 'POST') && $this->validate()) {
            $this->model_setting_setting->editSetting('module_remnant', $this->request->post);
            $this->session->data['success'] = $this->language->get('text_success');
            $this->response->redirect($this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true));
        }

        $data['heading_title'] = $this->language->get('heading_title');
        $data['text_edit'] = $this->language->get('text_edit');
        $data['text_enabled'] = $this->language->get('text_enabled');
        $data['text_disabled'] = $this->language->get('text_disabled');
        $data['entry_status'] = $this->language->get('entry_status');
        $data['entry_key'] = $this->language->get('entry_key');
        $data['help_key'] = $this->language->get('help_key');
        $data['button_save'] = $this->language->get('button_save');
        $data['button_cancel'] = $this->language->get('button_cancel');

        $data['error_warning'] = isset($this->error['warning']) ? $this->error['warning'] : '';

        if (isset($this->request->post['module_remnant_status'])) {
            $data['module_remnant_status'] = $this->request->post['module_remnant_status'];
        } else {
            $data['module_remnant_status'] = $this->config->get('module_remnant_status');
        }

        if (isset($this->request->post['module_remnant_key'])) {
            $data['module_remnant_key'] = $this->request->post['module_remnant_key'];
        } else {
            $data['module_remnant_key'] = $this->config->get('module_remnant_key');
        }

        $data['action'] = $this->url->link('extension/module/remnant', 'user_token=' . $this->session->data['user_token'], true);
        $data['cancel'] = $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true);

        $data['breadcrumbs'] = [
            [
                'text' => $this->language->get('text_home'),
                'href' => $this->url->link('common/dashboard', 'user_token=' . $this->session->data['user_token'], true),
            ],
            [
                'text' => $this->language->get('text_extension'),
                'href' => $this->url->link('marketplace/extension', 'user_token=' . $this->session->data['user_token'] . '&type=module', true),
            ],
            [
                'text' => $this->language->get('heading_title'),
                'href' => $this->url->link('extension/module/remnant', 'user_token=' . $this->session->data['user_token'], true),
            ],
        ];

        $data['header'] = $this->load->controller('common/header');
        $data['column_left'] = $this->load->controller('common/column_left');
        $data['footer'] = $this->load->controller('common/footer');

        $this->response->setOutput($this->load->view('extension/module/remnant', $data));
    }

    protected function validate()
    {
        if (!$this->user->hasPermission('modify', 'extension/module/remnant')) {
            $this->error['warning'] = $this->language->get('error_permission');
        }

        return !$this->error;
    }
}
