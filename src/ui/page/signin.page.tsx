import * as React from "react";
import {computed} from "mobx";
import {UILoginForm} from "../../store-ui/ui-login-form";
import {observer} from "mobx-react";

interface IProps {
    // store: IndexStore,
}

@observer
export class SigninPage extends React.Component<IProps> {

    constructor(p: IProps) {
        super(p);
    }

    @computed get uiLoginForm(): UILoginForm {
        return {} as any;
    }

    public render(): React.ReactNode {
        return (
            <div className="auth-page">
                <div className="container page">
                    <div className="row">

                        <div className="col-md-6 offset-md-3 col-xs-12">
                            <h1 className="text-xs-center">Sign up</h1>
                            <p className="text-xs-center">
                                <a href="">Have an account?</a>
                            </p>

                            <ul className="error-messages">
                                <li>That email is already taken</li>
                            </ul>

                            <form>
                                <fieldset className="form-group">
                                    <input
                                        value={this.uiLoginForm.email}
                                        onChange={this.uiLoginForm.setEmail}
                                        className="form-control form-control-lg"
                                        type="text"
                                        placeholder="Email"
                                    />
                                </fieldset>
                                <fieldset className="form-group">
                                    <input
                                        value={this.uiLoginForm.password}
                                        onChange={this.uiLoginForm.setPassword}
                                        className="form-control form-control-lg"
                                        type="password"
                                        placeholder="Password"
                                    />
                                </fieldset>
                                <button
                                    type="button"
                                    onClick={this.uiLoginForm.login}
                                    className="btn btn-lg btn-primary pull-xs-right"
                                >
                                    Sign up
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
