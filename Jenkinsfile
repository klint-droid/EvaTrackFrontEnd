// Test comment to trigger Jenkins build
pipeline {
    agent any


    /* Optional: Specify Node.js tool version configured in Jenkins settings */
    // tools {
    //     nodejs 'Node20'
    // }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Frontend - Code Quality') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm ci'

                echo 'Running static analysis lint...'
                sh 'npm run lint'

                echo 'Compiling production build...'
                sh 'npm run build'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Frontend lint & build passed successfully!'
        }
        failure {
            echo 'Frontend lint/build failed!'
        }
    }
}
