from pyteal import *


class Quiz:
    class Global_Variables:
        title = Bytes("TITLE")  # bytes
        time_per_question = Bytes("Q-TIME")  # uint64
        total_time = Bytes("TIME")  # uint64
        date = Bytes("DATE")  # uint64
        downvotes = Bytes("DOWNVOTES") #unit64
        no_of_questions = Bytes("QUESTIONS")  # uint64
        no_of_attempts = Bytes("ATTEMPTS")  # uint64
        no_of_successful_attempts = Bytes("S-ATTEMPTS")  # uint64
        pass_percent = Bytes("BENCHMARK")  # uint64

    class Local_Variables:
        player_high_score = Bytes("SCORE")  # uint64
        player_attempts = Bytes("P-ATTEMPTS")  # uint64
        in_quiz_state = Bytes("STATE")  # 0 inactive, 1 active #uint64

    class App_Methods:
        add_question = Bytes("add")
        start_quiz = Bytes("start")
        end_quiz = Bytes("end")

    # creates a new quiz
    def create_quiz(self):
        return Seq([
            Assert(
                And(
                    # check for appropriate number of arguments
                    Txn.application_args.length() == Int(3),
                    # check for note
                    Txn.note() == Bytes("speed-quiz-dapp:uv1"),
                    # check the arguments are not empty
                    Len(Txn.application_args[0]) > Int(0),
                    Btoi(Txn.application_args[1]) > Int(0),
                    Btoi(Txn.application_args[2]) > Int(0),
                )
            ),
            # store arguments
            App.globalPut(
                self.Global_Variables.title,
                Txn.application_args[0]
            ),
            App.globalPut(
                self.Global_Variables.time_per_question,
                Btoi(Txn.application_args[1])
            ),
            App.globalPut(
                self.Global_Variables.pass_percent,
                Btoi(Txn.application_args[2])
            ),
            App.globalPut(self.Global_Variables.total_time, Int(0)),
            App.globalPut(
                self.Global_Variables.date,
                Global.latest_timestamp()
            ),
            App.globalPut(self.Global_Variables.no_of_questions, Int(0)),
            App.globalPut(self.Global_Variables.no_of_attempts, Int(0)),
            App.globalPut(
                self.Global_Variables.no_of_successful_attempts,
                Int(0)
            ),
            App.globalPut(
                self.Global_Variables.downvotes,
                Int(0)
            ),
            Approve()
        ])

    # adds question to quiz. user funds contract with 1 algo to add question
    def add_question(self):
        total_time = ScratchVar(TealType.uint64)
        time_per_question = ScratchVar(TealType.uint64)
        no_of_questions = ScratchVar(TealType.uint64)
        return Seq([
            Assert(
                And(
                    # check if sender is creator
                    Txn.sender() == Global.creator_address(),
                    # check that this is a group txn, (1) this txn, (2) payment txn, and (3) new question txn
                    Global.group_size() == Int(3),
                    # check that this transaction is ahead
                    Txn.group_index() == Int(0),

                    # checks for payment transaction
                    Gtxn[1].type_enum() == TxnType.Payment,
                    Gtxn[1].receiver() == Global.current_application_address(),
                    Gtxn[1].close_remainder_to() == Global.zero_address(),
                    Gtxn[1].amount() >= Int(1000000),
                    Gtxn[1].sender() == Gtxn[0].sender(),
                )
            ),
            # store the quiz's total time, time per question and question count and update them.
            total_time.store(
                App.globalGet(self.Global_Variables.total_time)
            ),

            time_per_question.store(
                App.globalGet(self.Global_Variables.time_per_question)
            ),

            no_of_questions.store(
                App.globalGet(self.Global_Variables.no_of_questions)
            ),

            App.globalPut(
                self.Global_Variables.total_time,
                total_time.load() + time_per_question.load()
            ),

            App.globalPut(
                self.Global_Variables.no_of_questions,
                no_of_questions.load() + Int(1)
            ),
            Approve()
        ])

    def downVoteQuiz(self):
            return Seq([
            Assert(
                And(
                    # check that user has opted in
                    App.optedIn(Txn.accounts[0], Txn.applications[0]),
                    # check that quiz is not empty
                    App.globalGet(
                        self.Global_Variables.no_of_questions) > Int(0),
                    # check that this is a group txn, (1) this txn, (2) payment txn.
                    Global.group_size() == Int(1),
                    # check that this transaction is ahead
                    Txn.group_index() == Int(0),
                )
            ),

            # update attempts
            App.globalPut(
                self.Global_Variables.downvotes,
                self.Global_Variables.downvotes() + Int(1)
            ),

            Approve()
        ])

        
    # subscribes user to contract
    def opt_in(self):
        return Seq([
            App.localPut(
                Txn.accounts[0], self.Local_Variables.in_quiz_state, Int(0)),
            App.localPut(
                Txn.accounts[0], self.Local_Variables.player_attempts, Int(0)),
            App.localPut(
                Txn.accounts[0], self.Local_Variables.player_high_score, Int(0)),
            Approve()
        ])

    # user pays 1 algo fee to contract
    def start_quiz(self):
        player_attempts = ScratchVar(TealType.uint64)
        quiz_attempts = ScratchVar(TealType.uint64)
        in_quiz_state = App.localGet(
            Txn.accounts[0], self.Local_Variables.in_quiz_state)
        return Seq([
            Assert(
                And(
                    # check that user has opted in
                    App.optedIn(Txn.accounts[0], Txn.applications[0]),
                    # check player quiz status is set to 0
                    in_quiz_state == Int(0),
                    # check that quiz is not empty
                    App.globalGet(
                        self.Global_Variables.no_of_questions) > Int(0),
                    # check that this is a group txn, (1) this txn, (2) payment txn.
                    Global.group_size() == Int(2),
                    # check that this transaction is ahead
                    Txn.group_index() == Int(0),
                    # checks for payment transaction
                    Gtxn[1].type_enum() == TxnType.Payment,
                    Gtxn[1].receiver() == Global.current_application_address(),
                    Gtxn[1].close_remainder_to() == Global.zero_address(),
                    Gtxn[1].amount() == Int(1000000),
                    Gtxn[1].sender() == Gtxn[0].sender(),
                )
            ),
            # get attempts
            quiz_attempts.store(
                App.globalGet(self.Global_Variables.no_of_attempts)
            ),

            player_attempts.store(
                App.localGet(
                    Txn.accounts[0],
                    self.Local_Variables.player_attempts
                )
            ),

            # update attempts
            App.globalPut(
                self.Global_Variables.no_of_attempts,
                quiz_attempts.load() + Int(1)
            ),

            App.localPut(
                Txn.accounts[0],
                self.Local_Variables.player_attempts,
                player_attempts.load() + Int(1)
            ),

            # update player status
            App.localPut(
                Txn.accounts[0], self.Local_Variables.in_quiz_state, Int(1)),

            Approve()
        ])

    @ Subroutine(TealType.none)
    def send_funds(account: Expr, amount: Expr):
        return Seq(
            InnerTxnBuilder.Begin(),
            InnerTxnBuilder.SetFields(
                {
                    TxnField.type_enum: TxnType.Payment,
                    TxnField.receiver: account,
                    TxnField.amount: amount,
                    TxnField.fee: Int(0),
                }
            ),
            InnerTxnBuilder.Submit(),
        )

    # user pays 1 algo fee and adds a new question to the contract.
    def end_quiz(self):
        gotten_score_percent = ScratchVar(TealType.uint64)
        pass_percent = ScratchVar(TealType.uint64)
        no_of_successful_attempts = ScratchVar(TealType.uint64)
        player_curr_high_score = ScratchVar(TealType.uint64)
        return Seq([
            Assert(
                And(
                    # check for appropriate number of arguments
                    Txn.application_args.length() == Int(2),
                    # check that user has opted in
                    App.optedIn(Txn.accounts[0], Txn.applications[0]),
                    # check player quiz status is set to 1
                    App.localGet(
                        Txn.accounts[0], self.Local_Variables.in_quiz_state) == Int(1),
                    # check that percent is less than 100 percent
                    Btoi(Txn.application_args[1]) <= Int(100),
                    # check for fee pooling
                    Txn.fee() >= Global.min_txn_fee() * Int(2),
                )
            ),
            pass_percent.store(App.globalGet(
                self.Global_Variables.pass_percent)),

            gotten_score_percent.store(Btoi(Txn.application_args[1])),

            If(gotten_score_percent.load() >= pass_percent.load())
            .Then(
                Seq([
                    no_of_successful_attempts.store(
                        App.globalGet(
                            self.Global_Variables.no_of_successful_attempts)
                    ),

                    self.send_funds(Txn.accounts[0], Int(2000000)),

                    App.globalPut(
                        self.Global_Variables.no_of_successful_attempts,
                        no_of_successful_attempts.load() + Int(1)
                    )
                ])
            ),

            player_curr_high_score.store(
                App.localGet(
                    Txn.accounts[0], self.Local_Variables.player_high_score)
            ),

            # update player high-score with a new one
            If(player_curr_high_score.load() < Btoi(Txn.application_args[1]))
            .Then(
                App.localPut(
                    Txn.accounts[0],
                    self.Local_Variables.player_high_score,
                    Btoi(Txn.application_args[1])
                )
            ),

            App.localPut(
                Txn.accounts[0], self.Local_Variables.in_quiz_state, Int(0)),

            Approve()
        ])

    def delete_quiz(self):
        return Return(Txn.sender() == Global.creator_address())

    def approval_program(self):
        return Cond(
            [Txn.application_id() == Int(0), self.create_quiz()],
            [Txn.on_completion() == OnComplete.DeleteApplication,
             self.delete_quiz()],
            [Txn.on_completion() == OnComplete.OptIn, self.opt_in()],
            [Txn.application_args[0] == self.App_Methods.add_question,
             self.add_question()],
            [Txn.application_args[0] == self.App_Methods.start_quiz,
             self.start_quiz()],
            [Txn.application_args[0] == self.App_Methods.end_quiz,
             self.end_quiz()],
        )

    def clear_program(self):
        return Return(Int(1))


class Question:
    class Variables:
        question = Bytes("QUESTION")
        option1 = Bytes("OPTION1")
        option2 = Bytes("OPTION2")
        option3 = Bytes("OPTION3")
        option4 = Bytes("OPTION4")
        answer = Bytes("ANSWER")

    def create_question(self):
        return Seq([
            Assert(
                And(
                    # Sanity Checks
                    # check that it's a group txn
                    Global.group_size() == Int(3),
                    # check for position of txn
                    Txn.group_index() == Int(2),
                    # check first txn in group
                    Gtxn[0].type_enum() == TxnType.ApplicationCall,
                    Gtxn[0].application_args[0] == Bytes("add"),
                    # check second txn in group
                    Gtxn[1].type_enum() == TxnType.Payment,

                    # Safety Checks for this txn
                    # check for appropriate number of arguments
                    Txn.application_args.length() == Int(6),
                    # check the arguments are not empty
                    Len(Txn.application_args[0]) > Int(0),
                    Len(Txn.application_args[1]) > Int(0),
                    Len(Txn.application_args[2]) > Int(0),
                    Len(Txn.application_args[3]) > Int(0),
                    Len(Txn.application_args[4]) > Int(0),
                    Len(Txn.application_args[5]) > Int(0),
                )
            ),
            # store arguments
            App.globalPut(self.Variables.question, Txn.application_args[0]),
            App.globalPut(self.Variables.option1, Txn.application_args[1]),
            App.globalPut(self.Variables.option2, Txn.application_args[2]),
            App.globalPut(self.Variables.option3, Txn.application_args[3]),
            App.globalPut(self.Variables.option4, Txn.application_args[4]),
            App.globalPut(self.Variables.answer, Txn.application_args[5]),
            Approve()
        ])

    def delete_question(self):
        return Return(Txn.sender() == Global.creator_address())

    def approval_program(self):
        return Cond(
            [Txn.application_id() == Int(0), self.create_question()],
            [Txn.on_completion() == OnComplete.DeleteApplication,
             self.delete_question()],
        )

    def clear_program(self):
        return Return(Int(1))
