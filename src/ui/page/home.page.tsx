import * as React from "react";

import {observer} from "mobx-react";

import {ArticleService} from "../../services/article.service";
import {UIArticleList} from "../../store-ui/ui-model";
import ArticleList from "../components/article-list";
import {Container} from "typedi";

interface IProps {
    // store: IndexStore,
}

@observer
export class HomePage extends React.Component<IProps> {

    private articleService = Container.get(ArticleService);
    private uiArticleList1 = this.articleService.getUIModel(UIArticleList, "1");
    private uiArticleList2 = this.articleService.getUIModel(UIArticleList, "2");

    public render(): React.ReactNode {
        return (
            <section className="home-page">
                <div className="banner">
                    <div className="container">
                        <h1 className="logo-font">conduit</h1>
                        <p>A place to share your knowledge.</p>
                    </div>
                </div>
                <div className="container page">
                    <div className="row">
                        <div className="col-md-9">
                            <div className="feed-toggle">
                                <ul className="nav nav-pills outline-active">
                                    <li className="nav-item">
                                        <a className="nav-link disabled" href="">Your Feed</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link active" href="">Global Feed</a>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <ArticleList model={this.uiArticleList1} />
                            </div>
                            <div>
                                <ArticleList model={this.uiArticleList2} />
                            </div>
                        </div>
                        <div className="col-md-3">
                            {/*<TagList model={store.uiStore.tagList} />*/}
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}
