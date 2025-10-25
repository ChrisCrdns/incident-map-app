import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '3cec14b71a5d4060a8b0cc47b01f196f'
                    }
                    'incident-location-map': {
                        table: 'sys_ui_page'
                        id: 'a4fb03cc9a3e4d249466e48bc040ed98'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: 'fe9c8cd3cd544ce5bae64d12d161a77f'
                    }
                    'x_820505_incidentp/main': {
                        table: 'sys_ux_lib_asset'
                        id: '74b759dcaf1b43d58adda2bdbbc9d19b'
                    }
                    'x_820505_incidentp/main.js.map': {
                        table: 'sys_ux_lib_asset'
                        id: '6501e51022e147f584fdc81d332e100a'
                    }
                }
            }
        }
    }
}
