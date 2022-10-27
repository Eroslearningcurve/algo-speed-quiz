from pyteal import *

from speed_quiz_contract import *

import os

if __name__ == "__main__":

    cwd = os.path.dirname(__file__)

    approval_program_quiz = Quiz().approval_program()
    clear_program_quiz = Quiz().clear_program()

    approval_program_question = Question().approval_program()
    clear_program_question = Question().clear_program()

    # Compile approval program for quiz
    compiled_approval_quiz = compileTeal(
        approval_program_quiz, Mode.Application, version=6)
    print(compiled_approval_quiz)

    file_name = os.path.join(cwd, "quiz_approval.teal")
    with open(file_name, "w") as teal:
        teal.write(compiled_approval_quiz)
        teal.close()

    # Compile clear program for quiz
    compiled_clear_quiz = compileTeal(
        clear_program_quiz, Mode.Application, version=6)
    print(compiled_clear_quiz)
    file_name = os.path.join(cwd, "quiz_clear.teal")
    with open(file_name, "w") as teal:
        teal.write(compiled_clear_quiz)
        teal.close()

    # Compile approval program for question
    compiled_approval_question = compileTeal(
        approval_program_question, Mode.Application, version=6)
    print(compiled_approval_question)

    file_name = os.path.join(cwd, "question_approval.teal")
    with open(file_name, "w") as teal:
        teal.write(compiled_approval_question)
        teal.close()

  # Compile clear program for question
    compiled_clear_question = compileTeal(
        clear_program_question, Mode.Application, version=6)
    print(compiled_clear_question)
    file_name = os.path.join(cwd, "question_clear.teal")
    with open(file_name, "w") as teal:
        teal.write(compiled_clear_question)
        teal.close()
