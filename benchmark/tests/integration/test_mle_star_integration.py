#!/usr/bin/env python3
"""
Test script for MLE-STAR ensemble integration.

This script tests the basic functionality of the MLE-STAR implementation
including ensemble execution, voting strategies, and performance tracking.
"""

import asyncio
import logging
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from swarm_benchmark.mle_star import (
    MLEStarEnsembleExecutor, MLEStarConfig,
    MLScenarios, ClassificationScenario, RegressionScenario
)


async def test_classification_scenario():
    """Test basic classification ensemble."""
    print("🧠 Testing Classification Ensemble...")
    
    try:
        # Get small classification scenario
        scenario_config = MLScenarios.classification_benchmark_small()
        scenario = ClassificationScenario(scenario_config)
        
        # Run the scenario
        result = await scenario.run_scenario()
        
        print(f"✅ Classification Scenario: {'SUCCESS' if result['success'] else 'FAILED'}")
        if result['success']:
            metrics = result['metrics']
            print(f"   - Ensemble Size: {metrics.get('ensemble', {}).get('ensemble_size', 'N/A')}")
            print(f"   - Total Time: {result['execution_time']:.2f}s")
            print(f"   - Accuracy: {metrics.get('performance', {}).get('accuracy', 'N/A')}")
            print(f"   - Performance Targets Met: {result['performance_targets_met']}")
        else:
            print(f"   - Error: {result.get('error', 'Unknown error')}")
        
        return result['success']
        
    except Exception as e:
        print(f"❌ Classification test failed: {e}")
        return False


async def test_regression_scenario():
    """Test basic regression ensemble."""
    print("\n📊 Testing Regression Ensemble...")
    
    try:
        # Get small regression scenario
        scenario_config = MLScenarios.regression_benchmark_small()
        scenario = RegressionScenario(scenario_config)
        
        # Run the scenario
        result = await scenario.run_scenario()
        
        print(f"✅ Regression Scenario: {'SUCCESS' if result['success'] else 'FAILED'}")
        if result['success']:
            metrics = result['metrics']
            print(f"   - Ensemble Size: {metrics.get('ensemble', {}).get('ensemble_size', 'N/A')}")
            print(f"   - Total Time: {result['execution_time']:.2f}s")
            print(f"   - R² Score: {metrics.get('performance', {}).get('accuracy', 'N/A')}")
            print(f"   - Performance Targets Met: {result['performance_targets_met']}")
        else:
            print(f"   - Error: {result.get('error', 'Unknown error')}")
        
        return result['success']
        
    except Exception as e:
        print(f"❌ Regression test failed: {e}")
        return False


async def test_voting_strategies():
    """Test different voting strategies."""
    print("\n🗳️  Testing Voting Strategies...")
    
    try:
        from swarm_benchmark.mle_star.voting_strategies import (
            MajorityVoting, WeightedVoting, BayesianAveraging
        )
        
        # Test data
        test_predictions = [
            [0.7, 0.2, 0.1],  # Model 1 prediction
            [0.6, 0.3, 0.1],  # Model 2 prediction
            [0.8, 0.1, 0.1],  # Model 3 prediction
        ]
        
        # Test majority voting
        majority_voter = MajorityVoting()
        majority_result = await majority_voter.vote(test_predictions)
        print(f"   - Majority Voting: {majority_result}")
        
        # Test weighted voting
        weighted_voter = WeightedVoting(weights=[0.4, 0.4, 0.2])
        weighted_result = await weighted_voter.vote(test_predictions)
        print(f"   - Weighted Voting: {weighted_result}")
        
        # Test Bayesian averaging
        bayesian_voter = BayesianAveraging()
        bayesian_result = await bayesian_voter.vote(test_predictions)
        print(f"   - Bayesian Averaging: {bayesian_result}")
        
        print("✅ Voting strategies test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"❌ Voting strategies test failed: {e}")
        return False


async def test_model_coordinator():
    """Test model coordinator functionality."""
    print("\n🤖 Testing Model Coordinator...")
    
    try:
        from swarm_benchmark.mle_star.model_coordinator import ModelCoordinator
        
        coordinator = ModelCoordinator(max_parallel=3)
        
        # Spawn a test agent
        agent = await coordinator.spawn_agent(
            agent_id="test_model_1",
            model_type="random_forest",
            capabilities=["classification"],
            hyperparameters={"n_estimators": 10, "task": "classification"}
        )
        
        print(f"   - Agent spawned: {agent.agent_id}")
        print(f"   - Agent status: {agent.status.value}")
        
        # Clean up
        await coordinator.cleanup()
        
        print("✅ Model coordinator test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"❌ Model coordinator test failed: {e}")
        return False


async def test_performance_tracker():
    """Test performance tracking functionality."""
    print("\n📈 Testing Performance Tracker...")
    
    try:
        from swarm_benchmark.mle_star.performance_tracker import PerformanceTracker
        
        tracker = PerformanceTracker()
        
        # Start tracking session
        await tracker.start_tracking_session("test_session")
        
        # Register a model
        tracker.register_model("test_model", "random_forest")
        
        # Record some metrics
        tracker.record_training_time("test_model", 5.2)
        tracker.record_prediction_time("test_model", 0.1)
        tracker.record_prediction_confidence("test_model", 0.85)
        
        # Get summary
        summary = tracker.get_performance_summary()
        print(f"   - Session info: {summary['session_info']}")
        print(f"   - Models tracked: {len(summary['model_performances'])}")
        
        # End session
        await tracker.end_tracking_session()
        
        print("✅ Performance tracker test: SUCCESS")
        return True
        
    except Exception as e:
        print(f"❌ Performance tracker test failed: {e}")
        return False


async def run_comprehensive_test_suite():
    """Run comprehensive test suite for MLE-STAR integration."""
    print("🚀 Starting MLE-STAR Integration Test Suite")
    print("=" * 60)
    
    # Configure logging
    logging.basicConfig(
        level=logging.WARNING,  # Reduce noise during testing
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    test_results = []
    
    # Run individual tests
    test_results.append(await test_voting_strategies())
    test_results.append(await test_model_coordinator())
    test_results.append(await test_performance_tracker())
    test_results.append(await test_classification_scenario())
    test_results.append(await test_regression_scenario())
    
    # Summary
    successful_tests = sum(test_results)
    total_tests = len(test_results)
    
    print("\n" + "=" * 60)
    print(f"🏁 Test Suite Results: {successful_tests}/{total_tests} tests passed")
    
    if successful_tests == total_tests:
        print("🎉 All MLE-STAR integration tests PASSED!")
        return True
    else:
        print(f"⚠️  {total_tests - successful_tests} test(s) FAILED")
        return False


if __name__ == "__main__":
    # Run the test suite
    success = asyncio.run(run_comprehensive_test_suite())
    sys.exit(0 if success else 1)