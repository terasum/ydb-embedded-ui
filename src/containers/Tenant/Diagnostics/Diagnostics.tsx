import {useMemo} from 'react';
import qs from 'qs';
import cn from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router';

import {Switch, Tabs} from '@yandex-cloud/uikit';

//@ts-ignore
import TopQueries from './TopQueries/TopQueries';
//@ts-ignore
import DetailedOverview from './DetailedOverview/DetailedOverview';
//@ts-ignore
import TopShards from './TopShards/TopShards';
//@ts-ignore
import Storage from '../../Storage/Storage';
//@ts-ignore
import Network from './Network/Network';
//@ts-ignore
import Describe from './Describe/Describe';
//@ts-ignore
import HotKeys from './HotKeys/HotKeys';
//@ts-ignore
import Heatmap from '../../Heatmap/Heatmap';
//@ts-ignore
import Compute from './Compute/Compute';
//@ts-ignore
import Tablets from '../../Tablets/Tablets';

import routes, {createHref} from '../../../routes';
import {OLAP_TABLE_TYPE, TABLE_TYPE} from '../Tenant';
import {TenantGeneralTabsIds, TenantTabsGroups} from '../TenantPages';
import {GeneralPagesIds, DATABASE_PAGES, TABLE_PAGES, DIR_PAGES} from './DiagnosticsPages';
//@ts-ignore
import {enableAutorefresh, disableAutorefresh} from '../../../store/reducers/schema';

import './Diagnostics.scss';
interface DiagnosticsProps {
    type: string;
    additionalTenantInfo?: any;
    additionalNodesInfo?: any;
}

const b = cn('kv-tenant-diagnostics');

function Diagnostics(props: DiagnosticsProps) {
    const dispatch = useDispatch();
    const {
        currentSchemaPath,
        currentSchema: currentItem = {},
        autorefresh,
    } = useSelector((state: any) => state.schema);

    const location = useLocation();

    const history = useHistory();

    const queryParams = qs.parse(location.search, {
        ignoreQueryPrefix: true,
    });

    const {name: tenantName, generalTab = GeneralPagesIds.overview} = queryParams;

    const isDatabase = currentSchemaPath === tenantName;

    const pages = useMemo(() => {
        const {type} = props;
        const isTable = type === TABLE_TYPE || type === OLAP_TABLE_TYPE;

        let pages = DIR_PAGES;

        if (isDatabase) {
            pages = DATABASE_PAGES;
        } else if (isTable) {
            pages = TABLE_PAGES;
        }
        return pages;
    }, [props.type]);

    const forwardToDiagnosticTab = (tab: GeneralPagesIds) => {
        history.push(
            createHref(routes.tenant, undefined, {
                ...queryParams,
                [TenantTabsGroups.generalTab]: tab,
            }),
        );
    };
    const activeTab = useMemo(() => {
        if (pages.find((el) => el.id === generalTab)) {
            return generalTab;
        } else {
            const newPage = pages[0].id;
            forwardToDiagnosticTab(newPage);
            return newPage;
        }
    }, [pages, generalTab]);

    const onAutorefreshToggle = (value: boolean) => {
        if (value) {
            dispatch(enableAutorefresh());
        } else {
            dispatch(disableAutorefresh());
        }
    };

    const forwardToGeneralTab = (tab: TenantGeneralTabsIds) => {
        history.push(
            createHref(routes.tenant, undefined, {
                ...queryParams,
                [TenantTabsGroups.general]: tab,
            }),
        );
    };

    const renderTabContent = () => {
        const {type} = props;

        const tenantNameString = tenantName as string;

        switch (generalTab) {
            case GeneralPagesIds.overview: {
                return (
                    <DetailedOverview
                        type={type}
                        tenantName={tenantNameString}
                        additionalTenantInfo={props.additionalTenantInfo}
                    />
                );
            }
            case GeneralPagesIds.topQueries: {
                return (
                    <TopQueries
                        path={tenantNameString}
                        changeSchemaTab={forwardToGeneralTab}
                        type={type}
                    />
                );
            }
            case GeneralPagesIds.topShards: {
                return <TopShards path={tenantNameString} type={type} />;
            }
            case GeneralPagesIds.nodes: {
                return <Compute additionalNodesInfo={props.additionalNodesInfo} />;
            }
            case GeneralPagesIds.tablets: {
                return <Tablets path={currentItem.Path} />;
            }
            case GeneralPagesIds.storage: {
                return <Storage tenant={tenantNameString} database={true} />;
            }
            case GeneralPagesIds.network: {
                return <Network path={tenantNameString} />;
            }
            case GeneralPagesIds.describe: {
                return <Describe tenant={tenantNameString} />;
            }
            case GeneralPagesIds.hotKeys: {
                return <HotKeys type={type} />;
            }
            case GeneralPagesIds.graph: {
                return <Heatmap path={currentItem.Path} />;
            }
            default: {
                return <div>No data...</div>;
            }
        }
    };
    const renderTabs = () => {
        return (
            <div className={b('header-wrapper')}>
                <div className={b('tabs')}>
                    <Tabs
                        items={pages}
                        activeTab={activeTab as string}
                        wrapTo={({id}, node) => {
                            const path = createHref(routes.tenant, undefined, {
                                ...queryParams,
                                [TenantTabsGroups.generalTab]: id,
                            });

                            return (
                                <Link to={path} key={id} className={b('tab')}>
                                    {node}
                                </Link>
                            );
                        }}
                        allowNotSelected={true}
                    />
                    <Switch
                        checked={autorefresh}
                        onUpdate={onAutorefreshToggle}
                        content="Autorefresh"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className={b()}>
            {renderTabs()}
            <div className={b('page-wrapper')}>{renderTabContent()}</div>
        </div>
    );
}

export default Diagnostics;
