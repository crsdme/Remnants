<?php

class ModelExtensionModuleRemnant extends Model
{
    public function install()
    {
        $this->db->query("
            CREATE TABLE IF NOT EXISTS `" . DB_PREFIX . "remnant_product` (
                `product_id` int(11) NOT NULL,
                `remnant_id` varchar(36) NOT NULL,
                PRIMARY KEY (`product_id`),
                UNIQUE KEY `remnant_id` (`remnant_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8
        ");
    }

    public function uninstall()
    {
    }
}
