resource "azurerm_resource_group" "eventhub-rg" {
  location = "Central US"
  name     = "rg-eventhub-ftrfuel-cart-${var.environment}"
}

resource "azurerm_eventhub_namespace" "eventhub-ns-ftrfuel-cart" {
  count                    = 1
  name                     = "ftrfuel-cart-eventhub-namespace-${var.environment}"
  location                 = azurerm_resource_group.eventhub-rg.location
  resource_group_name      = azurerm_resource_group.eventhub-rg.name
  sku                      = "Standard"
  capacity                 = 1
  auto_inflate_enabled     = true
  maximum_throughput_units = 4
  tags                     = {
    environment = var.environment
  }
}

resource "azurerm_eventhub" "eventhub-ftrfuel-cart" {
  count               = 1
  name                = "ftrfuel-cart-eventhub-${var.environment}"
  namespace_name      = azurerm_eventhub_namespace.eventhub-ns-ftrfuel-cart[0].name
  resource_group_name = azurerm_resource_group.eventhub-rg.name
  partition_count     = 1
  message_retention   = 1
}

resource "azurerm_eventhub_consumer_group" "eventhub-ftrfuel-cart-consumergroup-logstash" {
  name                = "logstash"
  namespace_name      = azurerm_eventhub_namespace.eventhub-ns-ftrfuel-cart[0].name
  eventhub_name       = azurerm_eventhub.eventhub-ftrfuel-cart[0].name
  resource_group_name = azurerm_resource_group.eventhub-rg.name
}