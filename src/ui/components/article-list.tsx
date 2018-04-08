import * as React from "react";
import { observer } from "mobx-react";
import {UIArticleList} from "../../store-ui/ui-model";
import {computed} from "mobx";
import {Article} from "../../store-domain/article.class";

interface IProps {
    model: UIArticleList,
}

interface IItemProps {
    model: Article,
}

@observer
class ArticleItem extends React.Component<IItemProps> {

    @computed get model(): Article {
        return this.props.model;
    }

    public render(): React.ReactNode {
        return (
            <div className="article-preview">
                <div className="article-meta">
                    <a href="profile.html"><img src={this.model.author.image}/></a>
                    <div className="info">
                        <a href="" className="author">{this.model.author.username}</a>
                        <span className="date">{this.model.createdAt.toDateString()}</span>
                    </div>
                    <button className="btn btn-outline-primary btn-sm pull-xs-right">
                        <i className="ion-heart"></i> {this.model.favoritesCount}
                    </button>
                </div>
                <a href="" className="preview-link">
                    <h1>{this.model.title}</h1>
                    <p>{this.model.description}</p>
                    <span>Read more...</span>
                </a>
            </div>
        )
    }
}

@observer
class ArticleList extends React.Component<IProps> {

    public componentDidMount(): void {
        this.props.model.loadArticleList();
    }

    @computed get model(): UIArticleList {
        return this.props.model;
    }

    public render(): React.ReactNode {

        return (
            <div className="tag-list">
                {this.model.articleList.map((a) => (
                    <ArticleItem model={a} />
                ))}
            </div>
        )
    }
}

export default ArticleList;
