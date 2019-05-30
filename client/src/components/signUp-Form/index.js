// import all the dependencies
import React, { Component } from "react";
import { FormAction, FormLabel, FormButton, FormMessage, Dropdown, OptionForDropdown } from "../form";
import AddSchool from "../add-school";
import ErrorMessage from "../errorMessage";
import "./style.css";
import API from "../../utils/API";
import gradeLevel from "../../gradeLevel.json";

const statesList = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

// define a class SignUp to create the component
class SignUp extends Component {

    state = {
        allUsernames: [],
        allEmails: [],
        firstStepRegistration: true,
        parentInfo:
            [
                {
                    for: "userName",
                    label: "Enter a username",
                    placeholder: "username",
                    value: ""
                },
                {
                    for: "password",
                    label: "Enter your password (at least 8 characters)",
                    placeholder: "password",
                    value: ""
                },
                {
                    for: "email",
                    label: "Enter your email",
                    placeholder: "example@email.com",
                    value: ""
                },
                {
                    for: "photo",
                    label: "Enter a link for your profile picture",
                    placeholder: "https://www.picture-of-me.png",
                    value: ""
                },
                {
                    for: "city",
                    label: "Which city do you live in?",
                    placeholder: "city",
                    value: "",
                },
                {
                    for: "state",
                    label: "Which state do you live in?",
                    value: "Alabama",
                    options: statesList
                }
            ],
        kidInfo: 
            [
                {
                    for: "name",
                    label: "Enter the name of your kid",
                    placeholder: "kid's name",
                    value: ""
                },
                {
                    for: "grade",
                    label: "Which grade is your kid in?",
                    value: "1",
                    options: gradeLevel

                },
                {   
                    for: "school",
                    label: "Which school does your kid go to?",
                    value: "1",
                    options: []
                }    
            ],
        numberOfKid: 1,
        allKidsInfo: [],
        formMessage:
        {
            message: "Already Have An Account?",
            action: "Login",
            alt: "login"
        },
        hasError: false,
        passwordTooShort: false,
        usernameAlreadyExists: false,
        emailAlreadyExists: false,
        addKid: false,
        addSchool: false,
        messageSchoolAdded: false
    };

    componentDidMount() {
        // retrieves all the schools
        API.getAllSchools()
            .then(
                res => {
                    console.log(res.data);
                    let copy = [...this.state.kidInfo];
                    copy[2].options = res.data;
                    this.setState({
                        kidInfo: copy
                    })
                }
            )
            .catch(err => console.log(err));

        // get the info of the parents already in the database - to check username and email
        API.searchAllParentsInDB()
            .then(
                res => {
                    console.log(res.data);
                    // push into an array all the usernames and emails already in the database
                    for (var i = 0; i < res.data.length; i++) {
                        this.state.allUsernames.push(res.data[i].userName);
                        this.state.allEmails.push(res.data[i].email);
                    }
                    console.log(this.state.allUsernames);
                    console.log(this.state.allEmails);
                }
            )
    }

    // function to update the school list once/if a parent has created one
    updateSchoolList = () => {
        API.getAllSchools()
            .then(
                res => {
                    console.log(res.data);
                    let copy = [...this.state.kidInfo];
                    copy[2].options = res.data;
                    this.setState({
                        kidInfo: copy,
                        addSchool: false,
                        messageSchoolAdded: true
                    })

                }
            )
            .catch(err => console.log(err));
    }

    handleInputChangeParent = event => {
        const value = event.target.value;
        const key = event.target.getAttribute("data-id")
        let copy = [...this.state.parentInfo]
        copy[key].value = value
        this.setState({
            parentInfo: copy
        });
    }

    handleContinueButtonClick = event => {
        event.preventDefault();

        // if all the fields have been filled up
        if (this.state.parentInfo[0].value && this.state.parentInfo[1].value && this.state.parentInfo[2].value && this.state.parentInfo[3].value && this.state.parentInfo[4].value && this.state.parentInfo[5].value) {
            // if username doesn't already exist in the database
            if (this.state.allUsernames.indexOf(this.state.parentInfo[0].value) === -1) {
                // if the email doesn't already exist in the database
                if (this.state.allEmails.indexOf(this.state.parentInfo[2].value) === -1) {
                    // display the second part of the form
                    this.setState({
                        firstStepRegistration: false
                    });
                    console.log("parent info: ", this.state.parentInfo);
                    // if password isn't too short
                    if (this.state.parentInfo[1].value.length >= 8) {
                        // display the second part of the form
                        this.setState({
                            firstStepRegistration: false
                        });
                        console.log("parent info: ", this.state.parentInfo);
                    // if password too short
                    } else {
                        // display error message
                        this.setState({
                            passwordTooShort: true
                        });
                    }
                // if the email is already present in the database
                } else {
                    this.setState({
                        emailAlreadyExists: true
                    });
                }
            // if username is already present in the database
            } else {
                // display error message
                this.setState({
                    usernameAlreadyExists: true
                });
            }    
        // if all the fields haven't been filled up
        } else {
            // display error message
            this.setState({
                hasError: true
            })
        }
    }

    handleInputChangeKid = event => {
        const value = event.target.value;
        const key = event.target.getAttribute("data-id")
        let copy = [...this.state.kidInfo]
        copy[key].value = value
        this.setState({
            kidInfo: copy
        });
    }

    handleAddKidButtonClick = event => {
        event.preventDefault();

        // if the parent clicks the "add kid" button after entering info for the first kid, it will proceed
        if (this.state.kidInfo[0].value && this.state.kidInfo[1].value && this.state.kidInfo[2].value) {
            // copy the kidInfo
            let copyKid = [...this.state.kidInfo];
            // store the current kidInfo into the allKidInfo variable
            this.state.allKidsInfo.push(
                {
                    name: copyKid[0].value,
                    grade: copyKid[1].value,
                    schoolId: copyKid[2].value
                }
            );
            // clear the fields for kid form
            copyKid[0].value = "";
            copyKid[1].value = "1";
            copyKid[2].value = "1";
            // update kidInfo to get empty fields in form, add 1 kid to the counter and 
            // display new registration form for the other kid
            this.setState({
                kidInfo: copyKid,
                numberOfKid: this.state.numberOfKid + 1,
                addKid: true,
                messageSchoolAdded: false
            });
        // otherwise will get error message that the parent has to fill up the fields
        } else {
            this.setState({ 
                hasError: true
            });
        }
    }

    handleSignUpButtonClick = event => {
        event.preventDefault();

        // if the parent signs up without adding another kid or after adding a the last kid - grab the only (or last) kidInfo here
        let copyKid = [...this.state.kidInfo];
        this.state.allKidsInfo.push(
            {
                name: copyKid[0].value,
                grade: copyKid[1].value,
                schoolId: copyKid[2].value
            }
        );

        // console log for checking
        console.log("all kid info: ", this.state.allKidsInfo);

        // the parent has to enter info in every field to be able to submit form
        if (this.state.kidInfo[0].value && this.state.kidInfo[1].value && this.state.kidInfo[2].value) {
  
            API.signup(
                {
                    userName: this.state.parentInfo[0].value,
                    password: this.state.parentInfo[1].value,
                    email: this.state.parentInfo[2].value,
                    photoLink: this.state.parentInfo[3].value,
                    city: this.state.parentInfo[4].value,
                    state: this.state.parentInfo[5].value,
                    allKidsInfo: this.state.allKidsInfo
                }
            )
            .then(res => {
                window.location.reload()
            })
            .catch(err => console.log(err))
        // otherwise will get error message that the parent has to fill up the fields
        } else {

            this.setState({ 
                hasError: true
            })
        }
    }

    handleAddSchoolOption = event => {
        event.preventDefault();

        this.setState({
            addSchool: true,
            messageSchoolAdded: false
        })

    }

    handleCloseButtonClick = event => {
        event.preventDefault();

        this.setState({
            hasError: false,
            passwordTooShort: false,
            usernameAlreadyExists: false,
            emailAlreadyExists: false
        })
    }

    resetError = () => {
        if (this.state.hasError || this.state.passwordTooShort || this.state.usernameAlreadyExists || this.state.emailAlreadyExists) {
            setTimeout(() => {
                this.setState({
                    hasError: false,
                    passwordTooShort: false,
                    usernameAlreadyExists: false,
                    emailAlreadyExists: false,
                })
            }, 2000)
        }
    }


    render() {
        this.resetError();
        return (
            <div>
                {(this.state.firstStepRegistration) ? (
                    <div>
                        {(this.state.hasError) ? (
                            <ErrorMessage
                                message="Please fill up all the fields!"
                                handleCloseButtonClick={this.handleCloseButtonClick}
                            />
                        ) : (
                            ""
                        )}
                        {(this.state.passwordTooShort) ? (
                            <ErrorMessage
                                message="Your password should be at least 8 characters long!"
                                handleCloseButtonClick={this.handleCloseButtonClick}
                            />
                        ) : (
                            ""
                        )}
                        {(this.state.usernameAlreadyExists) ? (
                            <ErrorMessage
                                message="Sorry, this username is already taken!"
                                handleCloseButtonClick={this.handleCloseButtonClick}
                            />
                        ) : (
                            ""
                        )}
                        {(this.state.emailAlreadyExists) ? (
                            <ErrorMessage
                                message="Sorry, a parent already registered with this email!"
                                handleCloseButtonClick={this.handleCloseButtonClick}
                            />
                        ) : (
                            ""
                        )}
                        <FormAction>
                            {this.state.parentInfo.map((parentInfo, i) => {
                                if (parentInfo.for !== "state") {
                                    return (
                                        <FormLabel
                                            key={i}
                                            data={i}
                                            for={parentInfo.for}
                                            label={parentInfo.label}
                                            placeholder={parentInfo.placeholder}
                                            value={parentInfo.value}
                                            handleChange={this.handleInputChangeParent}
                                        />
                                    );
                                } else {
                                    return (
                                        <Dropdown
                                            key={i}
                                            data={i}
                                            for={parentInfo.for}
                                            label={parentInfo.label}
                                            value={parentInfo.value}
                                            handleChange={this.handleInputChangeParent}
                                        >
                                        {parentInfo.options.map((state, j) => {
                                            return (
                                                <OptionForDropdown option={state} value={state} key={j} />
                                            )
                                        })}
                                        </Dropdown>
                                    );  
                                }
                            })}
                        </FormAction>
                        <FormButton
                            nameButton="Continue"
                            handleButtonClick={this.handleContinueButtonClick}
                        />
                    </div>
                ) : (
                    <div>
                        {(this.state.hasError) ? (
                            <ErrorMessage
                                message="Please fill up all the fields!"
                                handleCloseButtonClick={this.handleCloseButtonClick}
                            />
                        ) : (
                            ""
                        )}
                        <FormAction>
                            {(!this.state.addKid) ? (
                                <div>
                                    <div className="font-weight-bold mb-2">Enter information for kid #1</div>
                                    {this.state.kidInfo.map((info, i) => {
                                        if (info.for === "name") {
                                            return (
                                                <FormLabel
                                                    key={i}
                                                    data={i}
                                                    for={info.for}
                                                    label={info.label}
                                                    value={info.value}
                                                    handleChange={this.handleInputChangeKid}
                                                />
                                            )
                                        } else {
                                            return (
                                                <Dropdown
                                                    key={i}
                                                    data={i}
                                                    for={info.for}
                                                    label={info.label}
                                                    value={info.value}
                                                    disabled={this.state.disabled}
                                                    handleChange={this.handleInputChangeKid}
                                                >
                                                    {info.options.map((item, j) => {
                                                        return (
                                                            <OptionForDropdown
                                                                option={item.name}
                                                                value={item.id}
                                                                key={j}
                                                            />
                                                        )
                                                    })}
                                                </Dropdown>
                                            )
                                        }
                                    })}
                                </div>
                            ) : (
                                <div>
                                    <div className="font-weight-bold text-success mb-2">Information saved for kid #{this.state.numberOfKid - 1}</div>
                                    <div className="font-weight-bold mb-2"> Enter information for kid #{this.state.numberOfKid}</div>
                                    {this.state.kidInfo.map((info, i) => {
                                        if (info.for === "name") {
                                            return (
                                                <FormLabel
                                                    key={i}
                                                    data={i}
                                                    for={info.for}
                                                    label={info.label}
                                                    value={info.value}
                                                    handleChange={this.handleInputChangeKid}
                                                />
                                            )
                                        } else {
                                            return (
                                                <Dropdown
                                                    key={i}
                                                    data={i}
                                                    for={info.for}
                                                    label={info.label}
                                                    value={info.value}
                                                    disabled={this.state.disabled}
                                                    handleChange={this.handleInputChangeKid}
                                                >
                                                    {info.options.map((item, j) => {
                                                        return (
                                                            <OptionForDropdown
                                                                option={item.name}
                                                                value={item.id}
                                                                key={j}
                                                            />
                                                        )
                                                    })}
                                                </Dropdown>
                                            )
                                        }
                                    })}       
                                </div>
                            )}
                            {this.state.messageSchoolAdded ? (
                                <p className="font-weight-bold text-success">Your school has been added to the dropdown menu!</p>
                            ) : (
                                ""
                            )}
                            <button className="mb-2 font-weight-bold p-0" onClick={this.handleAddSchoolOption} style={{border: "none", background: "none", color: "orange"}}>Didn't find your school? Click here to add it!</button>
                            {this.state.addSchool ? (
                                <AddSchool 
                                    toUpdateSchoolList={this.updateSchoolList}
                                />
                            ) : (
                                ""
                            )}
                            </FormAction>
                            <hr style={{border: "1px solid #176d88"}}></hr>
                            <FormButton
                                nameButton="I have another kid!"
                                handleButtonClick={this.handleAddKidButtonClick}
                            />
                            <FormButton
                                nameButton="Sign Up"
                                handleButtonClick={this.handleSignUpButtonClick}
                            />
                        </div>
                    )}

                <FormMessage
                    message={this.state.formMessage.message}
                    path={this.props.path}
                    action={this.state.formMessage.action}
                    id={this.state.formMessage.alt}
                />
            </div>
        );
    }

}


// export the component so it can be used by other files
export default SignUp;